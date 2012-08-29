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
import utils.reactivemongo._
import utils.reactivemongo.{ QueryBuilder => JsonQueryBuilder }
import reactivemongo.api.SortOrder.{ Ascending, Descending }

case class Project(name: String, realName: String, avatar: Option[String] = None) {

  def asMongoDBObject: MongoDBObject = {
    val project = MongoDBObject.newBuilder
    project += "name" -> name
    project += "realName" -> realName
    project += "avatar" -> avatar
    project.result
  }
}

object Project extends MongoDB("projects") {

  val ALL = "all"

  def assignAvatar(project: Project): Project = {
    project.name match {
      case "onconnect" => project.copy(avatar = Some("/assets/images/avatars/onconnect.png"))
      case _ => project.copy(avatar = Some("/assets/images/avatars/scanup.png"))
    }
  }

  def createAsync(project: JsValue): Future[LastError] = {
    collectAsync.insert[JsValue](project)
  }

  def createIfNot(project: Project) = {
    val byName = MongoDBObject("name" -> project.name)
    collection.findOne(byName).ifNone {
      collection += (assignAvatar(project).asMongoDBObject)
    }
  }

  def createIfNotAsync(project: JsValue): Future[Option[LastError]] = {
    val projectName: String = (project \ "name").as[String]
    byNameAsync(projectName).flatMap { projectOpt =>
      projectOpt.map(_ => Promise.pure(None)) getOrElse createAsync(project).map(Some(_))
    }
  }

  def byName(name: String): Option[Project] = {
    val byName = MongoDBObject("name" -> name)
    collection.findOne(byName).flatMap(fromMongoDBObject(_))
  }

  def byNameAsync(name: String): Future[Option[JsValue]] = {
    println(name)
    val byName = Json.obj("name" -> name)
    val jsonQuery = JsonQueryBuilder().query(byName)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def byNamesAsync(names: String*): Future[List[JsValue]] = {
    val matchProjects = Json.obj(
      "name" -> Json.obj(
        "$in" -> JsArray(names.map(JsString(_)))
      )
    )
    val jsonQuery = JsonQueryBuilder().query(matchProjects).sort("name" -> Ascending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList
  }

  def all(max: Int = 50): List[Project] = {
    collection.find().limit(max).toList.flatMap(fromMongoDBObject(_))
  }

  def allAsync(max: Int= 50): Future[List[JsValue]] = {
    val jsonQuery = JsonQueryBuilder().sort("name" -> Ascending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def exist(name : String): Boolean = byName(name).isDefined

  def existAsync(name : String): Promise[Boolean] = byNameAsync(name).map(_.isDefined)

  def fromMongoDBObject(project: MongoDBObject): Option[Project] = {
    for {
      name     <- project.getAs[String]("name")
      realName <- project.getAs[String]("realName")
    } yield(Project(name, realName, project.getAs[String]("avatar")))
  }

  implicit object ProjectFormat extends Format[Project] {

    def reads(json: JsValue): Project = Project(
      (json \ "name").as[String],
      (json \ "realName").as[String],
      (json \ "avatar").as[Option[String]]
    )

    def writes(p: Project): JsValue = Json.obj(
      "name"     -> p.name,
      "realName" -> p.realName,
      "avatar"   -> toJson(p.avatar)
    )
  }
}
