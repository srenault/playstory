package controllers

import akka.util.duration._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.Comet
import play.api.libs.akka._
import play.api.libs.json._

import play.api._
import play.api.mvc._
import play.api.data._
import validation.Constraints._

import models.Log
import actors.StoryActor
import actors.StoryActor._

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index())
  }

  def listen() = Action {
    implicit val LogComet = Comet.CometMessage[Log](dbLog => toJson(dbLog).toString)
    AsyncResult {
      (StoryActor.ref ? (Listen(), 5.seconds)).mapTo[Enumerator[Log]].asPromise.map { 
        chunks => Ok.stream(chunks &> Comet( callback = "window.parent.session.onReceive"))
      }
    }
  }

  def eval() = ToJsObject { json =>
    StoryActor.ref ! NewLog(Log.fromJsObject(json))
    Ok
  }

  private def ToJsObject(action: JsObject => Result) = Action { implicit request =>
    Logger.info("entering")
    Form(of("data" -> nonEmptyText)).bindFromRequest.fold(
      err => BadRequest("Empty json ?"), {
        case jsonStr => Json.parse(jsonStr) match {
          case jsObj: JsObject => action(jsObj)
          case JsUndefined(error) => Logger.info("BadRequest"); BadRequest("Invalid json: " + error)
          case _ => Logger.info("BadRequest"); BadRequest("Not a json object")
        }
      }
    )
  }
}
