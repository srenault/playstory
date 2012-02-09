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
    implicit val LogComet = Comet.CometMessage[Log] { log =>
      Logger.info(log.toString)
      toJson(log).toString
    }

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

  def eval() = Action(parse.json) { implicit request =>
    request.body match {
      case log: JsObject => StoryActor.ref ! NewLog(Log.fromJsObject(log)); Ok
      case _ => Logger.warn("Invalid log format"); BadRequest("Invalid Log format")
    }
  }
}
