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

  protected def playPulling(listenedProject: String, chunks: Enumerator[JsValue])(implicit request: AuthenticatedRequest, cometMessage: Comet.CometMessage[JsValue]) = {
    val comet = Comet(callback = "window.parent.PlayStory.Dashboard.Server.fromPulling")
    val prettyfy = Enumeratee.map[JsValue]{ l => Logger.debug("[Pulling] " + l); l}
    val filterByUser = Enumeratee.filter[JsValue] { l =>
      (listenedProject, Log.json.project(l)) match {
        case (Project.ALL, Some(projectName)) => request.user.projectNames.contains(projectName)
        case _ => Log.json.project(l).map { logProject =>
          listenedProject == logProject
        } getOrElse false
      }
    }

    request.headers.get("ACCEPT").map( _ match {
      case "text/event-stream" => {
        Logger.debug("[Story] Pushing data using Server Sent Event");
        Ok.stream(chunks &> filterByUser &> prettyfy &> EventSource()) withHeaders(CONTENT_TYPE -> "text/event-stream")
      }
      case _ => {
        Logger.debug("[Story] Pushing data using Commet");
        Ok.stream(chunks &> filterByUser &> comet)
      }
    }) orElse None
  }
}
