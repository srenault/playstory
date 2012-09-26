package models

import scala.concurrent.Future
import play.api.libs.concurrent._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import scalaz.OptionW
import scalaz.Scalaz._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.Logger
import db.MongoDB
import play.modules.reactivemongo.PlayBsonImplicits.{ JsValueWriter, JsValueReader }
import reactivemongo.core.commands.LastError
import utils.mongo.{ JsonQueryHelpers, QueryBuilder => JsonQueryBuilder }
import reactivemongo.api.SortOrder.{ Ascending, Descending }

case class Project(name: String, realName: String, avatar: Option[String] = None)

object Project extends MongoDB("projects") {

  val ALL = "all"

  def assignAvatar(project: Project): Project = {
    project.name match {
      case "onconnect" => project.copy(avatar = Some("/assets/images/avatars/onconnect.png"))
      case _ => project.copy(avatar = Some("/assets/images/avatars/scanup.png"))
    }
  }

  def create(project: JsValue): Future[LastError] = {
    collectAsync.insert[JsValue](project)
  }

  def createIfNot(project: JsValue): Future[Option[LastError]] = {
    val projectName: String = (project \ "name").as[String]
    byNameAsync(projectName).flatMap { projectOpt =>
      projectOpt.map(_ => Promise.pure(None)) getOrElse create(project).map(Some(_))
    }
  }

  def byName(name: String): Option[Project] = {
    val p: PlayPromise[Option[Project]] = byNameAsync(name).map { maybeProject =>
      maybeProject.map(_.as[Project](ProjectFormat))
    }
    p.await match {
      case Redeemed(project) => project
      case t: Thrown => None
    }
  }

  def byNameAsync(name: String): Future[Option[JsValue]] = {
    val byName = Json.obj("name" -> name)
    val jsonQuery = JsonQueryBuilder().query(byName)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def byNames(names: String*): Future[List[JsValue]] = {
    val matchProjects = Json.obj(
      "name" -> Json.obj(
        "$in" -> JsArray(names.map(JsString(_)))
      )
    )
    val jsonQuery = JsonQueryBuilder().query(matchProjects).sort("name" -> Ascending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList
  }

  def all(max: Int= 50): Future[List[JsValue]] = {
    val jsonQuery = JsonQueryBuilder().sort("name" -> Ascending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def exist(name : String): Promise[Boolean] = byNameAsync(name).map(_.isDefined)

  implicit object ProjectFormat extends Format[Project] {

    def reads(json: JsValue): JsResult[Project] = JsSuccess(Project(
      (json \ "name").as[String],
      (json \ "realName").as[String],
      (json \ "avatar").as[Option[String]]
    ))

    def writes(p: Project): JsValue = Json.obj(
      "name"     -> p.name,
      "realName" -> p.realName,
      "avatar"   -> toJson(p.avatar)
    )
  }
}
