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

object Story extends Controller with Secured {

  def home() = Authenticated { implicit request =>
    Logger.info("Welcome : " + request.user)
    val projects = Seq[Project]()
    Ok(views.html.home(Project.all))
  }

  def view(project: String) = Authenticated { implicit request =>
    Logger.info("Viewing specific project : " + project)
    Project.createIfNot(Project(project))
    val contacts = request.session.get("access_token").map { accessToken =>
      request.user.contacts(accessToken, 100).fold(
        error => {
          Logger.warn("Failed getting user contacts")
          Nil
        },
        identity
      )
    }.getOrElse {
      Logger.warn("Failed getting user contacts: no access token")
      Nil
    }
    Ok(views.html.story(project, contacts))
  }

  def listen(project: String) = Authenticated { implicit request =>
    Logger.info("Waitings logs...")
    AsyncResult {
      implicit val timeout = Timeout(5 second)
      (StoryActor.ref ? Listen(project)).mapTo[Enumerator[Log]].asPromise.map { chunks =>
        playPulling(chunks).getOrElse(BadRequest)
      }
    }
  }

  def last(project: String) = Action { implicit request =>
    Logger.info("Getting history of : " + project)
    val logs = Log.byProject(project)
    Ok(toJson(logs))
  }

  def eval() = Action { implicit request =>
    Logger.info("Evaluating a log ...")
    request.body.asJson.get match {
      case log: JsObject => StoryActor.ref ! NewLog(Log.fromJsObject(log)); Ok
      case log: JsValue => BadRequest("Not a json object")
      case _ => BadRequest("Invalid Log format: " + request.body)
    }
  }

  private def playPulling(chunks: Enumerator[Log])(implicit request: Request[AnyContent]) = {
    implicit val LogComet = Comet.CometMessage[Log](log => toJson(log).toString)
    val comet = Comet(callback = "window.parent.session.observable.log.receive")
    request.headers.get("ACCEPT").map( _ match {
      case "text/event-stream" => {
        Logger.debug("server sent event");
        SimpleResult(
          header = ResponseHeader(OK, Map(
            CONTENT_LENGTH -> "-1",
            CACHE_CONTROL -> "no-cache",
            CONTENT_TYPE -> "text/event-stream"
          )),chunks &> EventSource[Log]())
      }
      case _ => {
        Logger.debug("commet");
        Ok.stream(chunks &> comet)
      }
    }).orElse(None)
  }

}
