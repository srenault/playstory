package controllers

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.execution.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json._
import models.Log
import models.Project
import utils.mongo.MongoUtils

object Home extends Controller with Secured {

  def createProject() = Authenticated { implicit request =>
    request.body.asJson.map { json =>
       Project.createIfNot(json)
       Ok
    }.getOrElse(BadRequest)
  }

  def follow(project: String) = Authenticated { implicit request =>
    Async {
      request.user.follow(project).map { lastError =>
        MongoUtils.handleLastError(
          lastError,
          Ok,
          message => InternalServerError(message)
        )
      }
    }
  }

  def unfollow(project: String) = Authenticated { implicit request =>
    Async {
      request.user.unfollow(project).map { lastError =>
        MongoUtils.handleLastError(
          lastError,
          Ok,
          message => InternalServerError(message)
        )
      }
    }
  }

  def changeAvatar() = Authenticated { implicit request =>
    Ok
  }

  def allProjects() = Authenticated { implicit request =>
    Async {
      Project.all().map { projects =>
        Ok(Json.obj(
          "src"      -> request.uri,
          "projects" -> JsArray(projects)
        ))
      }
    }
  }

  def summary() = Authenticated { implicit request =>
    Logger.info("[Dashboard] Getting summary data...")
    val summary = Log.countByLevelAndProject(request.user.projectNames).map { case (project, counters) =>
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
