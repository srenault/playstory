package controllers

import akka.util.duration._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.Comet
import play.api.libs.json._
import play.api.libs.json.Json._

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._

import models.Log
import actors.StoryActor
import actors.StoryActor._

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index())
  }

  def listen(keywords: Option[String]) = Action {
    implicit val LogComet = Comet.CometMessage[Log](dbLog => toJson(dbLog).toString)

    val cometEnumeratee =  Comet( callback = "window.parent.session.onReceive")
    val finalEnumeratee = keywords.map { k =>
      Enumeratee.filter[Log](log => log.message.contains(keywords)) ><> cometEnumeratee
    }.getOrElse(cometEnumeratee)

    AsyncResult {
      (StoryActor.ref ? (Listen(), 5.seconds)).mapTo[Enumerator[Log]].asPromise.map {
        chunks => Ok.stream(chunks &> finalEnumeratee)
      }
    }
  }

  def eval() = ToJsObject { json =>
    println(json)
    StoryActor.ref ! NewLog(Log.fromJsObject(json))
    Ok
  }

  private def ToJsObject(action: JsObject => Result) = Action { implicit request =>
    Logger.info("entering")
    Form(("data" -> nonEmptyText)).bindFromRequest.fold(
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
