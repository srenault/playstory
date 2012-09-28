package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.json.Json._
import models.Log

object Home extends Controller with Secured {

  def createProject(project: String) = Authenticated { implicit request =>
    Ok
  }

  def follow(project: String) = Authenticated { implicit request =>
    Ok
  }

  def unfollow(project: String) = Authenticated { implicit request =>
    Ok
  }

  def changeAvatar() = Authenticated { implicit request =>
    Ok
  }

  def summary() = Authenticated { implicit request =>
    Logger.info("[Dashboard] Getting summary data...")
    val summary = Log.countByLevel().map { case (project, counters) =>
      Json.obj(
        "project" -> project,
        "counters" -> counters.map { case(level, count) =>
          Json.obj(
            "level" -> level,
            "count" -> count
          )
        }
      )
    }.toList
    Ok((Json.obj("src" -> request.uri, "summary" -> JsArray(summary))))
  }
}
