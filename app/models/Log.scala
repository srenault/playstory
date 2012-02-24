package models

import play.Logger
import play.api.libs.json._
import play.api.libs.json.Json._

import com.novus.salat._
import com.novus.salat.global._
import com.novus.salat.annotations._
import com.novus.salat.dao._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection

case class Log(project: String,
               logger: String,
               className: String,
               date: String,
               file: String,
               location: String,
               line: String,
               message: String,
               method: String,
               level: String,
               thread: String)

object Log {
  def fromJsObject(json: JsObject) = fromJson[Log](json)(LogFormat)

  import play.api.libs.json.Generic._

  implicit object LogFormat extends Format[Log] {
    def reads(json: JsValue): Log = Log(
      (json \ "project").as[String],
      (json \ "logger").as[String],
      (json \ "class").asOpt[String].getOrElse(""),
      (json \ "date").asOpt[String].getOrElse(""),
      (json \ "file").asOpt[String].getOrElse(""),
      (json \ "location").asOpt[String].getOrElse(""),
      (json \ "line").asOpt[String].getOrElse(""),
      (json \ "message").as[String],
      (json \ "method").as[String],
      (json \ "level").as[String],
      (json \ "thread").as[String]
    )

    def writes(l: Log): JsValue = JsObject(Seq(
      "project" -> JsString(l.project),
      "logger" -> JsString(l.logger),
      "class" -> JsString(l.className),
      "date" -> JsString(l.date),
      "file" -> JsString(l.file),
      "location" -> JsString(l.location),
      "line" -> JsString(l.line),
      "message" -> JsString(l.message),
      "method" -> JsString(l.method),
      "level" -> JsString(l.level),
      "thread" -> JsString(l.thread)
    ))  
  }
}

object LogDAO extends SalatDAO[Log, Int](collection = MongoConnection()("playstory")("logs"))
