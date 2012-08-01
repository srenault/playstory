package models

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import scalaz.OptionW
import scalaz.Scalaz._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.Logger
import db.MongoDB

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

  def createIfNot(project: Project) = {
    val byName = MongoDBObject("name" -> project.name)
    collection.findOne(byName).ifNone {
      collection += (assignAvatar(project).asMongoDBObject)
    }
  }

  def byName(name: String): Option[Project] = {
    val byName = MongoDBObject("name" -> name)
    collection.findOne(byName).flatMap(fromMongoDBObject(_))
  }

  def all(max: Int = 50): List[Project] = {
    collection.find().limit(max).toList.flatMap(fromMongoDBObject(_))
  }

  def exist(name : String): Boolean = byName(name).isDefined

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

    def writes(p: Project): JsValue = JsObject(Seq(
      "name" -> JsString(p.name),
      "realName" -> JsString(p.realName),
      "avatar" -> p.avatar.map(JsString(_)).getOrElse(JsNull)
    ))
  }
}
