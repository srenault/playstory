package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms
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

import models.Log
import actors.StoryActor
import actors.StoryActor._

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index())
  }

  def playPulling(chunks: Enumerator[Log])(implicit request: Request[AnyContent]) = {
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
      case _ => Ok.stream(chunks &> comet)
    }).orElse(None)
  }

  def listen() = Action { implicit request =>
    AsyncResult {
      implicit val timeout = Timeout(5 second)
      (StoryActor.ref ? Listen()).mapTo[Enumerator[Log]].asPromise.map { chunks =>
        playPulling(chunks).getOrElse(BadRequest)
      }
    }
  }

  def eval() = Action { implicit request =>
    request.body.asJson.get match {
      case log: JsObject => StoryActor.ref ! NewLog(Log.fromJsObject(log)); Ok
      case log: JsValue => BadRequest("Not a json object")
      case _ => BadRequest("Invalid Log format: " + request.body)
    }
  }
}
