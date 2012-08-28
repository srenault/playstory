package models

import java.util.Date
import scala.concurrent.Future
import scala.util.matching.Regex
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.modules.reactivemongo.PlayBsonImplicits.{ JsValueWriter, JsValueReader }
import play.modules.reactivemongo.MongoHelpers
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.iteratee.Enumerator
import play.Logger
import db.MongoDB
import reactivemongo.bson.handlers.DefaultBSONHandlers._
import reactivemongo.bson.handlers._
import utils.reactivemongo._
import utils.reactivemongo.{ QueryBuilder => JsonQueryBuilder }
import MongoHelpers.{ ObjectId, RegEx }
import reactivemongo.api.QueryBuilder
import reactivemongo.api.SortOrder.{ Ascending, Descending }
import reactivemongo.api.QueryOpts

case class Log(
  _id: ObjectId,
  project: String,
  logger: String,
  className: String,
  date: Date,
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

  def asMongoDBObject: MongoDBObject = Log.asMongoDBObject(this)
}

object Log extends MongoDB("logs", indexes = Seq("keywords", "level", "date", "project")) with Searchable {

  val byEnd = MongoDBObject("date" -> -1)

  def all(max: Int = 50): List[Log] = {
    collection.find().sort(byEnd)
                     .limit(max)
                     .flatMap(fromMongoDBObject(_))
                     .toList.reverse
  }

  def allAsync(max: Int= 50): Future[List[JsValue]] = {
    val limit = QueryOpts(batchSizeN = 2)
    val byEnd = "date" -> Descending
    val jsonQuery = JsonQueryBuilder().sort(byEnd)
    val query = QueryBuilder().sort(byEnd)
    JsonQueryHelpers.find(collectAsync, jsonQuery, limit).toList
    //collectAsync.find[JsValue](query, limit)(DefaultBSONReaderHandler, JsValueReader).toList
  }

  def byId(id: ObjectId): Option[Log] = {
    val byId = MongoDBObject("_id" -> id)
    collection.findOne(byId).flatMap(Log.fromMongoDBObject(_))
  }

  def byIdAsync(id: ObjectId): Future[Option[JsValue]] = {
    val byId = Json.obj("_id" -> ObjectId(id.toString))
    val jsonQuery = JsonQueryBuilder(Some(byId))
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def byIds(ids: Seq[ObjectId], max: Int = 50): List[Log] = {
    collection.find("_id" $in ids).sort(byEnd)
                                  .limit(max)
                                  .flatMap(fromMongoDBObject(_))
                                  .toList.reverse
  }

  def byIdsAsync(ids: Seq[ObjectId], max: Int = 50): Future[List[JsValue]] = {
    val limit = QueryOpts(batchSizeN = max)
    val byEnd = "date" -> Descending
    val $in = Json.obj(
      "_id" -> Json.obj("$in" -> JsArray(ids.map(id => ObjectId(id.toString))))
    )
    val jsonQuery = JsonQueryBuilder(Some($in)).sort(byEnd)
    JsonQueryHelpers.find(collectAsync, jsonQuery, limit).toList
  }

  def search(project: String, fields: List[Regex], max: Int = 50): List[Log] = {
    val byProject = MongoDBObject("project" -> project)
    collection.find(byKeywords(fields) ++ byProject)
              .sort(byEnd)
              .limit(max)
              .flatMap(fromMongoDBObject(_))
              .toList.reverse
  }

  def searchAsync(project: String, fields: List[Regex], max: Int = 50): Future[List[JsValue]] = {
    val byProject = Json.obj("project" -> project)
    val limit = QueryOpts(batchSizeN = max)
    val byEnd = "date" -> Descending
    val $all = Json.obj(
      "keywords" -> Json.obj("$all" -> JsArray(fields.map(f => RegEx(f.toString))))
    )
    val jsonQuery = JsonQueryBuilder(Some($all)).sort(byEnd)
    JsonQueryHelpers.find(collectAsync, jsonQuery, limit).toList
  }

  def byProject(project: String, max: Int = 50): List[Log] = {
    val byProject = MongoDBObject("project" -> project)
    collection.find(byProject).sort(byEnd)
                              .limit(max)
                              .flatMap(fromMongoDBObject(_))
                              .toList.reverse
  }

  def byLevel(level: String, projectOpt: Option[String] = None, max: Int = 50): List[Log] = {
    val byLevel = MongoDBObject("level" -> level.toUpperCase)

    projectOpt.map { project =>
      val byProject = MongoDBObject("project" -> project)
      collection.find(byProject ++ byLevel).sort(byEnd)
                                           .limit(max)
                                           .flatMap(fromMongoDBObject(_))
                                           .toList.reverse
    }.getOrElse {
      collection.find(byLevel).sort(byEnd)
                              .limit(max)
                              .flatMap(fromMongoDBObject(_))
                              .toList.reverse
    }
  }

  def byProjectBefore(project: String, before: Date, max: Int = 50): List[Log] = {
    val byProject = MongoDBObject("project" -> project)
    val byBefore = "date" $lt before.getTime
    collection.find(byProject ++ byBefore).sort(byEnd)
                                          .limit(max)
                                          .flatMap(fromMongoDBObject(_))
                                          .toList.reverse
  }

  def byProjectAfter(project: String, after: Date, max: Int = 50, level: Option[String] = None): List[Log] = {
    val byProject = MongoDBObject("project" -> project)
    val byAfter = "date" $gt after.getTime
    val byLevel = level.map(lvl => MongoDBObject("level" -> lvl.toUpperCase)).getOrElse(MongoDBObject.empty)

    collection.find(byProject ++ byAfter ++ byLevel).sort(byEnd)
                                                    .limit(max)
                                                    .flatMap(fromMongoDBObject(_))
                                                    .toList.reverse
  }

  def byProjectFrom(project: String, from: Long, max: Int = 50): List[Log] = {
    collection.find(
      "date" $gt from, MongoDBObject("project" -> project)
    ).sort(byEnd).limit(max).flatMap(fromMongoDBObject(_)).toList.reverse
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

  def create(log: Log) = {
    collection += log.asMongoDBObject
  }

  def createAsync(stream: Enumerator[JsValue]) {
    collectAsync.insert[JsValue](stream, 1)
  }

  def createAsync(log: JsValue) {
    collectAsync.insert[JsValue](log)
  }

  def addComment(id: ObjectId, comment: Comment) = {
    Logger.debug("[Log] Adding log for %s".format(id))
    collection.update(MongoDBObject("_id" -> id), $push("comments" -> comment.asMongoDBObject))
  }

  def fromJsObject(json: JsObject) = fromJson[Log](json)(LogFormat)

  def asMongoDBObject(log: Log): MongoDBObject = {
    val mongoLog = MongoDBObject.newBuilder
    mongoLog += "_id" -> log._id
    mongoLog += "project" -> log.project
    mongoLog += "logger" -> log.logger
    mongoLog += "className" -> log.className
    mongoLog += "date" -> log.date
    mongoLog += "file" -> log.file
    mongoLog += "location" -> log.location
    mongoLog += "line" -> log.line
    mongoLog += "message" -> log.message
    mongoLog += "method" -> log.method
    mongoLog += "level" -> log.level
    mongoLog += "thread" -> log.thread
    mongoLog += "comments" -> log.comments
    mongoLog ++= asKeywords(asWords(log.message))
    mongoLog.result
  }

  def fromMongoDBObject(log: MongoDBObject): Option[Log] = {
    for {
      _id       <- log.getAs[ObjectId]("_id")
      project   <- log.getAs[String]("project")
      logger    <- log.getAs[String]("logger")
      className <- log.getAs[String]("className")
      date      <- log.getAs[Date]("date")
      file      <- log.getAs[String]("file")
      location  <- log.getAs[String]("location")
      line      <- log.getAs[Double]("line")
      message   <- log.getAs[String]("message")
      method    <- log.getAs[String]("method")
      level     <- log.getAs[String]("level")
      thread    <- log.getAs[String]("thread")
    } yield {
      val comments: BasicDBList = log.getAs[BasicDBList]("comments").getOrElse(new BasicDBList())
      Log(_id, project, logger, className, date, file, location, line.toLong, message,
          method, level, thread, comments.toList.flatMap {
            case c: DBObject => Comment.fromMongoDBObject(c)
          }
      )
    }
  }

  implicit object LogFormat extends Format[Log] {

    private def asDate(timestamp: Long) = new Date(timestamp)

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
      (json \ "className").as[String],
      asDate((json \ "date").as[String].toLong),
      (json \ "file").as[String],
      (json \ "location").as[String],
      (json \ "line").as[String].toLong,
      (json \ "message").as[String],
      (json \ "method").as[String],
      (json \ "level").as[String],
      (json \ "thread").as[String],
      (json \ "comments").asOpt[Seq[Comment]].getOrElse(Nil)
    )

    def writes(l: Log): JsValue = {
      import MongoHelpers.{ ObjectId, Date }
      Json.obj(
        "_id"       -> ObjectId(l._id.toString),
        "project"   -> l.project,
        "logger"    -> l.logger,
        "className" -> l.className,
        "date"      -> Date(l.date),
        "file"      -> l.file,
        "location"  -> l.location,
        "line"      -> l.line,
        "message"   -> l.message,
        "method"    -> l.method,
        "level"     -> l.level,
        "thread"    -> l.thread,
        "comments"  -> toJson(l.comments)
      )
    }
  }
}
