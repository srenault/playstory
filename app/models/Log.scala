package models

import java.util.Date
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import play.Logger
import db.MongoDB

case class Log(
  _id: ObjectId,
  project: String,
  logger: String,
  className: String,
  date: Long,
  file: String,
  location: String,
  line: Long,
  message: String,
  method: String,
  level: String,
  thread: String,
  comments: Seq[Comment]
) {

  def addComment(comment: Comment) = Log.addComment(_id, comment)

  def countByLevel(): List[(String, Double)] = Log.countByLevel(project)

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
    log += "comments" -> comments
    log.result
  }
}

object Log extends MongoDB("logs") {

  private val byBegin = MongoDBObject("date" -> 1)
  private val byEnd = MongoDBObject("date" -> -1)

  def all(max: Int = 50): List[Log] = {
    find(max, byEnd).toList.map(fromMongoDBObject(_)).flatten
  }

  def byId(id: ObjectId): Option[Log] =
    findOne("_id" -> id).flatMap(Log.fromMongoDBObject(_))

  def byIds(ids: Seq[ObjectId], max: Int = 50): List[Log] = {
    collection.find("_id" $in ids).limit(max)
              .map(fromMongoDBObject(_))
              .toList.flatten
  }

  def byProject(project: String, max: Int = 50): List[Log] = {
    find(max, byEnd, "project" -> project).map(fromMongoDBObject(_)).flatten
  }

  def byLevel(level: String, projectOpt: Option[String] = None, max: Int = 50): List[Log] = {
    val byLevel = ("level" -> level.toUpperCase)
    projectOpt.map { project =>
      val byProject = ("project" -> project)
      find(max, byEnd, byProject, byLevel).map(fromMongoDBObject(_)).flatten
    }.getOrElse {
      find(max, byEnd, byLevel).map(fromMongoDBObject(_)).flatten
    }
  }

  def byProjectFrom(project: String, from: Long, max: Int = 50): List[Log] = {
    collection.find(
      "date" $gt from, MongoDBObject("project" -> project)
    ).limit(max).map(fromMongoDBObject(_)).toList.flatten
  }

  def countByLevel(projects: String*): List[(String, Double)] = {
    val mapFunction = """
    function() {
        emit(this.level, { count: 1 });
    }
    """

    val reduceFunction = """
    function(key, values) {
        var result = { count:  0 };
        values.forEach(function(value) {
            result.count += value.count;
        });
        return result;
     }
     """

    val byProjects = projects.size match {
      case size: Int if size > 0 => Some("project" $in projects.toArray)
      case _ => None
    }

    val results = collection.mapReduce(
      mapFunction,
      reduceFunction,
      MapReduceInlineOutput,
      byProjects
    ).cursor.toList

    results.flatMap { result =>
      for {
        level <- result.getAs[String]("_id")
        value <- result.getAs[DBObject]("value")
        count <- value.getAs[Double]("count")
      } yield {
        (level, count)
      }
    }
  }

  def create(log: Log) = save(log.asMongoDBObject)

  def addComment(id: ObjectId, comment: Comment) = {
    Logger.debug("[Log] Adding log for %s".format(id))
    collection.update(MongoDBObject("_id" -> id), $push("comments" -> comment.asMongoDBObject))
  }

  def fromJsObject(json: JsObject) = fromJson[Log](json)(LogFormat)

  def fromMongoDBObject(log: MongoDBObject): Option[Log] = {
    for {
      _id       <- log.getAs[ObjectId]("_id")
      project   <- log.getAs[String]("project")
      logger    <- log.getAs[String]("logger")
      className <- log.getAs[String]("className")
      date      <- log.getAs[Long]("date")
      file      <- log.getAs[String]("file")
      location  <- log.getAs[String]("location")
      line      <- log.getAs[Long]("line")
      message   <- log.getAs[String]("message")
      method    <- log.getAs[String]("method")
      level     <- log.getAs[String]("level")
      thread    <- log.getAs[String]("thread")
    } yield {
      val comments: BasicDBList = log.getAs[BasicDBList]("comments").getOrElse(new BasicDBList())
      Log(_id,
          project,
          logger,
          className,
          date,
          file,
          location,
          line,
          message,
          method,
          level,
          thread,
          comments.toList.map {
            case c: DBObject => Comment.fromMongoDBObject(c)
          }.flatten
      )
    }
  }

  implicit object LogFormat extends Format[Log] {

    def counterByLevelJSON(counterByLevel: (String, Double)): JsValue = {
      counterByLevel match {
        case (project, count) => JsObject(Seq(
          "level" -> JsString(project),
          "count" -> JsNumber(count)
        ))
      }
    }

    def reads(json: JsValue): Log = Log(
      (json \ "_id").asOpt[String].map(new ObjectId(_)).getOrElse(new ObjectId),
      (json \ "project").as[String],
      (json \ "logger").as[String],
      (json \ "class").as[String],
      (json \ "date").as[String].toLong,
      (json \ "file").as[String],
      (json \ "location").as[String],
      (json \ "line").as[String].toLong,
      (json \ "message").as[String],
      (json \ "method").as[String],
      (json \ "level").as[String],
      (json \ "thread").as[String],
      (json \ "comments").asOpt[Seq[Comment]].getOrElse(Nil)
    )

    def writes(l: Log): JsValue = JsObject(Seq(
      "_id" -> JsString(l._id.toString),
      "project" -> JsString(l.project),
      "logger" -> JsString(l.logger),
      "class" -> JsString(l.className),
      "date" -> JsNumber(l.date),
      "file" -> JsString(l.file),
      "location" -> JsString(l.location),
      "line" -> JsNumber(l.line),
      "message" -> JsString(l.message),
      "method" -> JsString(l.method),
      "level" -> JsString(l.level),
      "thread" -> JsString(l.thread),
      "comments" -> toJson(l.comments)
    ))
  }
}
