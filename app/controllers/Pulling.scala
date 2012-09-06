package controllers

import play.api.mvc._
import play.api.libs.iteratee._
import play.api.libs.Comet
import play.api.libs.EventSource
import play.api.libs.json._
import play.api.libs.json.Json._
import play.Logger

import models.{Project, Log}

trait Pulling {
  self: Controller =>

  protected def playPulling(chunks: Enumerator[JsValue])(implicit request: AuthenticatedRequest, cometMessage: Comet.CometMessage[JsValue]) = {
    val comet = Comet(callback = "window.parent.PlayStory.Home.FeedsPresent.server.fromPulling")
    val filterByUser = Enumeratee.filter[JsValue] { l =>
      Log.json.project(l).map { project =>
         request.user.isFollowedProject(project)
      } getOrElse false
    }

    request.headers.get("ACCEPT").map( _ match {
      case "text/event-stream" => {
        Logger.debug("[Story] Pushing data using Server Sent Event");
        Ok.stream(chunks &> filterByUser &> EventSource()) withHeaders(CONTENT_TYPE -> "text/event-stream")
      }
      case _ => {
        Logger.debug("[Story] Pushing data using Commet");
        Ok.stream(chunks &> comet)
      }
    }).orElse(None)
  }
}
