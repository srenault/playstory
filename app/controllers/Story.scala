package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._

import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.Comet
import play.api.libs.EventSource
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.templates._

import akka.pattern.ask
import akka.util.duration._
import akka.util.Timeout

import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.casbah.Imports._

import models.{Log, User, Project, Comment}
import actors.StoryActor
import actors.StoryActor._

object Story extends Controller with Secured with Pulling {

  def home = Authenticated { implicit request =>
    Logger.info("[Story] Welcome : " + request.user)
    Project.byName("onconnect").foreach { project =>
      request.user.follow(project)
    }
    Project.byName("scanup").foreach { project =>
      request.user.follow(project)
    }
    Ok(views.html.home.index(request.user))
  }

  def view(project: String) = Authenticated { implicit request =>
    Logger.info("[Story] Viewing specific project : " + project)
    Ok
  }

  private def toCompleteLog(log: Log)(implicit request: RequestHeader) = {
    JsObject(Seq(
      "log" -> toJson(log),
      "project" -> toJson(Project.byName(log.project)),
      "src" -> JsString(request.uri)
    )).toString
  }

  def listen(project: String) = Authenticated { implicit request =>
    Logger.info("[Story] Waitings logs...")
    AsyncResult {
      implicit val timeout = Timeout(5 second)
      (StoryActor.ref ? Listen(project)).mapTo[Enumerator[Log]].asPromise.map { chunks =>
        implicit val LogComet = Comet.CometMessage[Log](log => toCompleteLog(log))
        playPulling(chunks).getOrElse(BadRequest)
      }
    }
  }

  val commentForm = Form(
    mapping(
      "author"  -> nonEmptyText,
      "message" -> nonEmptyText
    )((author, message) => Comment(new ObjectId(author), message))
     ((comment: Comment) => Some((comment.author.toString, comment.message)))
  )

  def comment(project: String, id: String) = Authenticated { implicit request =>
    Logger.info("[Story] Comment log #%s from project %s".format(id, project))
    commentForm.bindFromRequest.fold(
      error => BadRequest,
      newComment => Log.byId(new ObjectId(id)).map { l =>
        l.addComment(newComment)
        Ok
      }.getOrElse(BadRequest)
    )
  }

  def lastFrom(project: String, from: Long) = Action { implicit request =>
    Logger.info("[Story] Getting history of %s from %".format(project, from))

    val logs = project match {
      case Project.ALL => Log.all().map(toCompleteLog(_))
      case _ => Log.byProjectFrom(project, from).map(toCompleteLog(_))
    }

    Ok(toJson(logs))
  }

  def last(project: String) = Action { implicit request =>
    Logger.info("[Story] Getting history of %s".format(project))

    val logs = project match {
      case Project.ALL => Log.all().map(toCompleteLog(_))
      case _ => Log.byProject(project).map(toCompleteLog(_))
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
}
