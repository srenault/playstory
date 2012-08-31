package controllers

import scalaz.OptionW
import scalaz.Scalaz._
import scala.concurrent.Future
import java.util.Date
import scalaz.OptionW
import scalaz.Scalaz._
import play.api._
import play.api.mvc._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.Comet
import play.api.libs.EventSource
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.templates._
import play.api.libs.concurrent.execution.defaultContext
import play.api.Play.current
import reactivemongo.core.commands.LastError
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.casbah.Imports._
import actors.StoryActor
import actors.StoryActor._
import akka.pattern.ask
import akka.util.Timeout
import akka.util.duration._

import models.{ Log, User, Project, Comment, Searchable }

object Dashboard extends Controller with Secured with Pulling {

  def home = Authenticated { implicit request =>
    Logger.info("[Dashboard] Welcome : " + request.user)

    Project.byNameAsync("onconnect").onComplete {
      case Right(None) => request.user.followAsync("onconnect")
      case _ =>
    }

    Project.byNameAsync("scanup").onComplete {
      case Right(None) => request.user.followAsync("scanup")
      case _ =>
    }

    Ok(views.html.home.index(request.user))
  }

  def listen(project: String) = Authenticated { implicit request =>
    Logger.info("[Dashboard] Waitings logs...")
    AsyncResult {
      implicit val timeout = Timeout(5 second)
      (StoryActor.ref ? Listen(project)).mapTo[Enumerator[Log]].asPromise.map { chunks =>
        Log.createAsync(chunks.map(toJson(_)))
        implicit val LogComet = Comet.CometMessage[Log](log => wrappedLog(log).toString)
        playPulling(chunks).getOrElse(BadRequest)
      }
    }
  }

  def search(project: String, keywords: List[String]) = Authenticated { implicit request =>
    Logger.info("[Dashboard] Searching logs for project " + project)
    AsyncResult {
      Log.searchAsync(project, Searchable.asRegex(keywords)).map { foundLogs =>
        Ok(JsArray(
          foundLogs.map(wrappedLog)
        ))
      }
    }
  }

  //TODO map reduce
  def inbox(project: String) = Authenticated { implicit request =>
    Logger.info("[Dashboard] Getting inbox data of %s...".format(project))
    val countersOpt = project match {
      case Project.ALL => Some(Log.countByLevel())
      case projectName => Project.byName(project).map(_ => Log.countByLevel(project))
    }
    countersOpt.map { counters =>
      Ok(wrappedInbox(counters))
    } getOrElse BadRequest
  }

  def comment(project: String, id: String) = Authenticated { implicit request =>
    Logger.info("[Dashboard] Comment log #%s from project %s".format(id, project))
    val logId = new ObjectId(id)
    request.body.asJson.map { comment =>
      Async {
        Log.byIdAsync(logId).flatMap { logOpt =>
          logOpt.map { log => 
            log.as[Log].addCommentAsync(comment).map {
              case LastError(true, _, _, _, _) => Ok
              case LastError(false, Some(errMsg), code, errorMsg, doc) => InternalServerError(errMsg)
            }
          } getOrElse Promise.pure(
            BadRequest("[Dashboard] Failed to comment log. The follow log was not found: " + id)
          )
        }
      }
    } getOrElse BadRequest("[Dashboard] Malformated JSON comment: " + request.body)
  }

  def bookmark(project: String, id: String) = Authenticated { implicit request =>
    Logger.info("[Dashboard] Bookmark log #%s from project %s".format(id, project))
    val logId = new ObjectId(id)
    if(request.user.hasBookmark(logId)) {
      Async {
        Log.byIdAsync(logId).flatMap {
          case Some(foundLog) => request.user.bookmarkAsync(logId).map(_ => Ok)
          case _ => Promise.pure(
            BadRequest("[Dashboard] Failed to bookmark a log. It was not found")
          )
        }
      }
    } else BadRequest("[Dashboard] Failed to bookmark a log. It is already bookmarked")
  }

  def bookmarks() = Authenticated { implicit request =>
    Logger.info("[Dashboard] Getting all bookmarks ")
    Async {
      request.user.bookmarksAsync.map { bookmarkedLogs =>
        Ok(JsArray(
          bookmarkedLogs.map(wrappedLog)
        ))
      }
    }
  }

  def byLevel(project: String, level: String) = Action { implicit request =>
    Logger.info("[Dashboard] Getting logs by level for %s".format(project))
    Async {
      val specificProject = if (project == Project.ALL) None else Some(project)
      Log.byLevelAsync(level, specificProject).map { logs =>
        Ok(JsArray(
          logs.map(wrappedLog)
        ))
      }
    }
  }

  def more(project: String, id: String, limit: Int, level: Option[String]) = Action { implicit request =>
    Logger.info("[Dashboard] Getting more logs from project %s and log %s.".format(project, id))
    val logRefId = new ObjectId(id)
    Async {
      Log.byIdAsync(logRefId).flatMap { logRefOpt =>
        (for {
          logRef <- logRefOpt
          date   <- Log.date(logRef)
        } yield {
          Log.byProjectAfterAsync(project, date, level, limit).map { logsAfter =>
            Ok(JsArray(
              logsAfter.map(wrappedLog)
            ))
          }
        }) getOrElse Promise.pure(
            BadRequest("[Dashboard] Failed to comment log. The following log was not found: " + id)
        )
      }
    }
  }

  def withContext(project: String, id: String, limit: Int) = Action { implicit request =>
    Logger.info("[Dashboard] Getting on log %s with its context for project %s.".format(project, id))
    val limitBefore, limitAfter = scala.math.round(limit/2)
    val logId = new ObjectId(id)
    Async {
      Log.byIdAsync(logId).flatMap { logOpt =>
        (for {
          log <- logOpt
          date   <- Log.date(log)
        } yield {
          val beforeLogs = Log.byProjectBeforeAsync(project, date, None, limitBefore)
          val afterLogs = Log.byProjectAfterAsync(project, date, None, limitAfter)
          Promise.sequence(List(beforeLogs, afterLogs)).map { beforeAfter =>
            val foundLogs = beforeAfter.reduceLeft((before, after) => before ::: (log :: after))
              Ok(JsArray(
                foundLogs.map(wrappedLog)
              ))
          }
        }) getOrElse Promise.pure(
          BadRequest("[Dashboard] Failed to getting one log with his context: The following log wans not found: " + id)
        )
      }
    }
  }

  def lastFrom(project: String, from: Long) = Action { implicit request =>
    Logger.info("[Dashboard] Getting history of %s from %".format(project, from))
    Async {
      project match {
        case Project.ALL => Log.allAsync().map { logs =>
          Ok(JsArray(
            logs.map(wrappedLog)
          ))
        }
        case _ => Log.byProjectAfterAsync(project, new Date(from)).map { logs =>
          Ok(JsArray(
            logs.map(wrappedLog)
          ))
        }
      }
    }
  }

  def last(project: String) = Action { implicit request =>
    Logger.info("[Dashboard] Getting history of %s".format(project))
    Async {
      project match {
        case Project.ALL => Log.allAsync().map { logs =>
          Ok(JsArray(
            logs.map(wrappedLog)
          ))
        }
        case _ => Log.byProjectAsync(project).map { logs =>
          Ok(JsArray(
            logs.map(wrappedLog)
          ))
        }
      }
    }
  }

  def eval() = Action { implicit request =>
    request.body.asJson.get match {
      case log: JsObject => {
        StoryActor.ref ! NewLog(Log.fromJsObject(log))
        Ok
      }
      case log: JsValue => BadRequest("[Dashboard] Not a json object")
      case _ => BadRequest("[Dashboard] Invalid Log format: " + request.body)
    }
  }

  private def wrappedLog(log: Log)(implicit request: RequestHeader) = {
    JsObject(Seq(
      "log" -> toJson(log),
      "project" -> toJson(Project.byName(log.project)),
      "src" -> JsString(request.uri)
    ))
  }

  private def wrappedLog(log: JsValue)(implicit request: RequestHeader): JsValue = {
    Json.obj(
      "log" -> log,
      "src" -> request.uri
    )
  }

  private def wrappedInbox(counters: List[(String, Double)])(implicit request: RequestHeader) = {
    JsArray(
      counters.map { counter =>
        JsObject(Seq(
          "counter" -> Log.LogFormat.counterByLevelJSON(counter),
          "src" -> JsString(request.uri)
        ))
    })
  }
}
