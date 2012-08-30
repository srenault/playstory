package controllers

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

object Story extends Controller with Secured with Pulling {

  def home = Authenticated { implicit request =>
    Logger.info("[Story] Welcome : " + request.user)

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
    Logger.info("[Story] Waitings logs...")
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
    Logger.info("[Story] Searching logs for project " + project)
    AsyncResult {
      Log.searchAsync(project, Searchable.asRegex(keywords)).flatMap { foundLogs =>
        wrappedLog(JsArray(foundLogs))
      }.map(Ok(_))
    }
  }

  def inbox(project: String) = Authenticated { implicit request =>
    Logger.info("[Story] Getting inbox data of %s...".format(project))

    val countersOpt = project match {
      case Project.ALL => Some(Log.countByLevel())
      case projectName => Project.byName(project).map(_ => Log.countByLevel(project))
    }

    countersOpt.map { counters =>
      Ok(wrappedInbox(counters))
    }.getOrElse(BadRequest)
  }

  def comment(project: String, id: String) = Authenticated { implicit request =>
    Logger.info("[Story] Comment log #%s from project %s".format(id, project))

    val objId = new ObjectId(id)
    request.body.asJson.map { comment =>
      Async {
        Log.byIdAsync(objId).flatMap { logOpt =>
          logOpt.map { log => 
            log.as[Log].addCommentAsync(comment).map {
              case LastError(true, _, _, _, _) => {
                Ok("Comment inserted")
              }
              case LastError(false, Some(errMsg), code, errorMsg, doc) => {
                InternalServerError(errMsg)
              }
            }
          } getOrElse Promise.pure(
            NotFound("Failed to comment log. It was not found")
          )
        }
      }
    } getOrElse BadRequest("Malformated JSON comment")
  }

  def bookmark(project: String, id: String) = Authenticated { implicit request =>
    Logger.info("[Story] Bookmark log #%s from project %s".format(id, project))
    val logId = new ObjectId(id)

    if(request.user.hasBookmark(logId)) {
      Async {
        Log.byIdAsync(logId).flatMap {
          case Some(foundLog) => request.user.bookmarkAsync(logId).map(_ => Ok("Bookmarked"))
          case _ => Promise.pure(
            NotFound("Failed to bookmark a log. It was not found")
          )
        }
      }
    } else BadRequest("Failed to bookmark a log. It is already bookmarked")
  }

  def bookmarks() = Authenticated { implicit request =>
    Logger.info("[Story] Getting all bookmarks ")
    Ok(toJson(request.user.bookmarks.map(wrappedLog(_))))
  }

  def byLevel(project: String, level: String) = Action { implicit request =>
    Logger.info("[Story] Getting logs by level for %s".format(project))
    val logs = project match {
      case Project.ALL => Log.byLevel(level).map(wrappedLog(_))
      case _ => Log.byLevel(level, Some(project)).map(wrappedLog(_))
    }
    Ok(toJson(logs))
  }

  def more(project: String, id: String, limit: Int, level: Option[String]) = Action { implicit request =>
    Logger.info("[Story] Getting more logs from project %s and log %s.".format(project, id))
    Log.byId(new ObjectId(id)).map { log =>
      val logs = Log.byProjectAfter(project, log.date, limit, level)
      Ok(toJson(logs.map(wrappedLog(_))))
    }.getOrElse(BadRequest)
  }

  def withContext(project: String, id: String, limit: Int) = Action { implicit request =>
    Logger.info("[Story] Getting on log %s with its context for project %s.".format(project, id))
    val limitBefore, limitAfter = scala.math.round(limit/2)
    val logsOpt: Option[List[Log]] = Log.byId(new ObjectId(id)).map { log =>
      val beforeLogs = Log.byProjectBefore(project, log.date, limitBefore)
      val afterLogs = Log.byProjectAfter(project, log.date, limitAfter)
      beforeLogs ::: (log :: afterLogs)
    }
    logsOpt.map { logs =>
      Ok(toJson(logs.map(wrappedLog(_))))
    }.getOrElse(BadRequest)
  }

  def lastFrom(project: String, from: Long) = Action { implicit request =>
    Logger.info("[Story] Getting history of %s from %".format(project, from))
    val logs = project match {
      case Project.ALL => Log.all().map(wrappedLog(_))
      case _ => Log.byProjectAfter(project, new Date(from)).map(wrappedLog(_))
    }

    Ok(toJson(logs))
  }

  def last(project: String) = Action { implicit request =>
    Logger.info("[Story] Getting history of %s".format(project))

    val logs = project match {
      case Project.ALL => Log.all().map(wrappedLog(_))
      case _ => Log.byProject(project).map(wrappedLog(_))
    }

    Ok(toJson(logs))
  }

  def eval() = Action { implicit request =>
    request.body.asJson.get match {
      case log: JsObject => {
        StoryActor.ref ! NewLog(Log.fromJsObject(log))
        Ok
      }
      case log: JsValue => BadRequest("[Story] Not a json object")
      case _ => BadRequest("[Story] Invalid Log format: " + request.body)
    }
  }

  private def wrappedLog(log: Log)(implicit request: RequestHeader) = {
    JsObject(Seq(
      "log" -> toJson(log),
      "project" -> toJson(Project.byName(log.project)),
      "src" -> JsString(request.uri)
    ))
  }

  private def wrappedLog(log: JsValue)(implicit request: RequestHeader): Future[JsValue] = {
    val projectName = (log \ "project").as[String]
    Project.byNameAsync(projectName).map { projectOpt: Option[JsValue] =>
      Json.obj(
        "log" -> log,
        "project" -> projectOpt,
        "src" -> request.uri
      )
    }
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
