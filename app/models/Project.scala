package models

import play.api.libs.json._
import play.api.libs.json.Json._

import com.novus.salat._
import com.novus.salat.global._
import com.novus.salat.annotations._
import com.novus.salat.dao._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection

case class Project(name: String)

object Project {

  def createIfNot(project: Project) = {
    if(!Project.exist(project.name)) ProjectDAO.insert(project)
    None
  }

  def byName(name: String): Option[Project] = ProjectDAO.findOne(MongoDBObject("name" -> name))

  def all: List[Project] = ProjectDAO.find(MongoDBObject("name" -> ".*".r)).toList

  def exist(name : String): Boolean = byName(name).isDefined

  import play.api.libs.json.Generic._
  implicit object ProjectFormat extends Format[Project] {
    def reads(json: JsValue): Project = Project(
      (json \ "name").as[String]
    )

    def writes(p: Project): JsValue = JsObject(Seq(
      "name" -> JsString(p.name)
    ))
  }
}

object ProjectDAO extends SalatDAO[Project, Int](collection = MongoConnection()("playstory")("projects"))
