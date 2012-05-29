package models

import java.util.Date
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import db.MongoDB

case class Log(
  _id: ObjectId,
  project: String,
  logger: String,
  className: String,
  date: String,
  file: String,
  location: String,
  line: String,
  message: String,
  method: String,
  level: String,
  thread: String
) {

  def asMongoDBObject: MongoDBObject = {
    val log = MongoDBObject.newBuilder
    log += "_id" -> _id
    log += "project" -> project
    log += "logger" -> logger
    log += "className" -> className
    log += "date" -> date
    log += "file" -> file
    log += "location" -> location
    log += "line" -> line
    log += "message" -> message
    log += "method" -> method
    log += "level" -> level
    log += "thread" -> thread
    log.result
  }
}

object Log extends MongoDB("logs") {

  def all(max: Int = 50): List[Log] = {
    find()(max).toList.map(fromMongoDBObject(_)).flatten
  }

  def byProject(project: String, max: Int = 50): List[Log] = {
    find("project" -> project)(max).map(fromMongoDBObject(_)).flatten
  }

  def byProjectFrom(project: String, from: Long, max: Int = 50): List[Log] = {
    collection.find(
      MongoDBObject("project" -> project),
      "time" $gt from
    ).limit(max).map(fromMongoDBObject(_)).toList.flatten
  }

  def create(log: Log) = save(log.asMongoDBObject)

  def fromJsObject(json: JsObject) = fromJson[Log](json)(LogFormat)

  def fromMongoDBObject(log: MongoDBObject): Option[Log] = {
    for {
      _id       <- log.getAs[ObjectId]("_id")
      project   <- log.getAs[String]("project")
      logger    <- log.getAs[String]("logger")
      className <- log.getAs[String]("className")
      date      <- log.getAs[String]("date")
      file      <- log.getAs[String]("file")
      location  <- log.getAs[String]("location")
      line      <- log.getAs[String]("line")
      message   <- log.getAs[String]("message")
      method    <- log.getAs[String]("method")
      level     <- log.getAs[String]("level")
      thread    <- log.getAs[String]("thread")
    } yield {
      Log(_id, project, logger, className, date, file, location, line, message, method, level, thread)
    }
  }

  import play.api.libs.json.Generic._
  implicit object LogFormat extends Format[Log] {
    def reads(json: JsValue): Log = Log(
      (json \ "_id").asOpt[String].map(new ObjectId(_)).getOrElse(new ObjectId),
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
      "_id" -> JsString(l._id.toString),
      "project" -> JsString(l.project),
      "logger" -> JsString(l.logger),
      "class" -> JsString(l.className),
      "date" -> JsNumber(l.date.toLong), //FIXME
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
