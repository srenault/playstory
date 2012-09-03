package controllers

import com.mongodb.casbah.Imports._
import java.util.Date
import models.{Log, Project, Searchable}
import play.api._
import play.api.libs.concurrent.execution.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc._
import reactivemongo.core.commands.LastError
import scala.concurrent.Future

object Tests extends Controller {

  def test = Action { implicit request =>
    Async {
      Log.all().map { logs =>
        Ok(logs.toString)
      }

      Log.byId(new ObjectId("503e3bde1a8800322e0103fd")).map { log =>
        Ok(log.toString)
      }

      val ids = List("503e3bde1a8800322e0103fd",
                     "503e3bde1a8800322e0103fe",
                     "503e3bdf1a8800322e010405",
                     "503e3bde1a8800322e0103f9").map(new ObjectId(_))

      Log.byIds(ids).map { logs =>
        Ok(logs.toString)
      }

      val keywords = Searchable.asRegex(List("version", "plugin"))
      Log.search("onconnect", keywords).map { logs =>
        Ok(logs.toString)
      }

      Log.byProject("onconnect").map { logs =>
        Ok(logs.toString)
      }

      Log.byLevel("WARN", Some("onconnect")).map { logs =>
        Ok(logs.toString)
      }

      Log.byProjectBefore("onconnect", new Date).map { logs =>
        Ok(logs.toString)
      }

      Log.byProjectAfter("onconnect", new Date).map { logs =>
        Ok(logs.toString)
      }

      val jsonLog = toJson(Log(new ObjectId,
                          "project",
                          "logger",
                          "className",
                          new Date,
                          "file",
                          "location",
                          0,
                          "message",
                          "method",
                          "level",
                          "thread",
                          Nil))

      Log.create(jsonLog).map {
        case LastError(true, _, _, _, _) => {
          Ok("Insert succeed")
        }
        case LastError(false, Some(errMsg), code, errorMsg, doc) => {
          InternalServerError(errMsg)
        }
      }

      Project.byNameAsync("onconnect").map { project =>
        Ok(project.toString)
      }

      val project = toJson(Project("name", "realName"))
      Project.createIfNot(project).map {
        case Some(LastError(true, _, _, _, _)) => {
          Ok("Insert succeed")
        }
        case Some(LastError(false, Some(errMsg), code, errorMsg, doc)) => {
          InternalServerError(errMsg)
        }
        case None => NotFound("Project already exist")
      }

      Project.all().map { projects =>
        Ok(projects.toString)
      }

      Project.exist("name").map { isDefined =>
        Ok(isDefined.toString)
      }

      Project.byNames("name", "nname").map { projects =>
        Ok(projects.toString)
      }
    }
  }
}
