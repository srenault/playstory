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

import models.{Log, LogDAO, User, Project}
import actors.StoryActor
import actors.StoryActor._

object Story extends Controller with Secured with Pulling {

  def home = Authenticated { implicit request =>
    Logger.info("[Story] Welcome : " + request.user)
    Ok(views.html.home(Project.all))
  }

  def view(project: String) = Authenticated { implicit request =>
    Logger.info("[Story] Viewing specific project : " + project)
    Project createIfNot(Project(project))
    Ok(views.html.story(project, Nil))
  }

  def listen(project: String) = Authenticated { implicit request =>
    Logger.info("[Story] Waitings logs...")
    AsyncResult {
      implicit val timeout = Timeout(5 second)
      (StoryActor.ref ? Listen(project)).mapTo[Enumerator[Log]].asPromise.map { chunks =>
        playPulling(chunks).getOrElse(BadRequest)
      }
    }
  }

  def last(project: String) = Action { implicit request =>
    Logger.info("[Story] Getting history of : " + project)
    val logs = Log.byProject(project)
    Ok(toJson(logs))
  }

  def eval() = Action { implicit request =>
    Logger.info("[Story] Evaluating a log ...")
    request.body.asJson.get match {
      case log: JsObject => StoryActor.ref ! NewLog(Log.fromJsObject(log)); Ok
      case log: JsValue => BadRequest("[Story] Not a json object")
      case _ => BadRequest("[Story] Invalid Log format: " + request.body)
    }
  }
}
