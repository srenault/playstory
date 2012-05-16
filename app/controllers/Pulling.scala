package controllers

import play.api.mvc._
import play.api.libs.iteratee._
import play.api.libs.Comet
import play.api.libs.EventSource
import play.api.libs.json._
import play.api.libs.json.Json._
import play.Logger

import models.Log

trait Pulling {
  self: Controller =>

  protected def playPulling(chunks: Enumerator[Log])(implicit request: Request[AnyContent]) = {
    implicit val LogComet = Comet.CometMessage[Log](log => toJson(log).toString)
    val comet = Comet(callback = "window.parent.session.observable.log.receive")
    request.headers.get("ACCEPT").map( _ match {
      case "text/event-stream" => {
        Logger.debug("[Story] Pushing data using Server Sent Event");
        Ok.stream(chunks &> EventSource()) withHeaders(CONTENT_TYPE -> "text/event-stream")
      }
      case _ => {
        Logger.debug("[Story] Pushing data using Commet");
        Ok.stream(chunks &> comet)
      }
    }).orElse(None)
  }
}
