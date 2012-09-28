package models

import java.util.Date
import scala.concurrent.Future
import scala.util.matching.Regex
import play.Logger
import play.api.libs.iteratee.Enumerator
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.json.util._
import play.modules.reactivemongo.PlayBsonImplicits.JsValueWriter
import reactivemongo.api.{QueryBuilder, QueryOpts, FailoverStrategy}
import reactivemongo.api.SortOrder.{ Ascending, Descending }
import reactivemongo.bson.handlers.DefaultBSONHandlers._
import reactivemongo.core.commands.LastError
import com.mongodb.casbah.Imports._
import utils.mongo.{QueryBuilder => JsonQueryBuilder, _}
import db.MongoDB

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
  comments: Seq[Comment] = Nil
) {
  def comment(comment: JsValue) = Log.comment(_id, comment)
}

object Log extends MongoDB("logs") with Searchable {

  override def indexes = List(
    List("project"),
    List("level"),
    List("project", "level"),
    List("keywords"),
    List("level", "keywords"),
    List("project", "level", "keywords")
  )

  type LogFromWeb = (String, String, String, Date, String, String,
                     Long, String, String, String, String)

  object json {
    def date(log: JsValue): Option[Date] = (log \ "date" \ "$date").asOpt[Long].map(new Date(_))
    def project(log: JsValue): Option[String] = (log \ "project").asOpt[String]
  }

  def all(max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val jsonQuery = JsonQueryBuilder().sort("date" -> Descending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def byId(id: ObjectId): Future[Option[JsValue]] = {
    val byId = Json.obj("_id" -> Json.obj("$oid" -> id.toString))
    val jsonQuery = JsonQueryBuilder().query(byId)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def byIds(ids: List[ObjectId], max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byEnd = "date" -> Descending
    val matchIds = Json.obj(
      "_id" -> Json.obj(
        "$in" -> JsArray(ids.map(id => Json.obj("$oid" -> id.toString)))
      )
    )
    val jsonQuery = JsonQueryBuilder().query(matchIds).sort(byEnd)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList
  }

  def search(projects: List[String], fields: List[Regex], level: Option[String], max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byProjects = Json.obj("project" -> Json.obj("$in" -> projects))
    val jsonQuery = JsonQueryBuilder().query(byKeywords(fields) ++ byProjects).sort("date" -> Descending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def byProject(projects: List[String], max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byProjects = Json.obj("project" -> Json.obj("$in" -> projects))
    val jsonQuery = JsonQueryBuilder().query(byProjects).sort("date" -> Descending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def byLevel(level: String, projects: List[String], max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byProjects = Json.obj("project" -> Json.obj("$in" -> projects))
    val byLevel = Json.obj("level" -> level.toUpperCase)

    val jsonQuery = JsonQueryBuilder().query(byProjects ++ byLevel).sort("date" -> Descending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def byProjectBefore(projects: List[String], before: Date, levelOpt: Option[String] = None, max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byProjects = Json.obj("project" -> Json.obj("$in" -> projects))
    val byBefore = Json.obj("date" -> Json.obj("$lt" -> Json.obj("$date" -> before.getTime)))
    val byLevel = levelOpt.map { level =>
      Json.obj("level" -> level.toUpperCase)
    }.getOrElse(Json.obj())

    val jsonQuery = JsonQueryBuilder().query(byProjects ++ byBefore ++ byLevel).sort("date" -> Ascending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def byProjectAfter(projects: List[String], before: Date, levelOpt: Option[String] = None, max: Int = Config.mongodb.limit): Future[List[JsValue]] = {
    val byProjects = Json.obj("project" -> Json.obj("$in" -> projects))
    val byAfter = Json.obj("date" -> Json.obj("$gt" -> Json.obj("$date" -> before.getTime)))
    val byLevel = levelOpt.map { level =>
      Json.obj("level" -> level.toUpperCase)
    }.getOrElse(Json.obj())

    val jsonQuery = JsonQueryBuilder().query(byProjects ++ byAfter ++ byLevel).sort("date" -> Descending)
    JsonQueryHelpers.find(collectAsync, jsonQuery).toList(max)
  }

  def countByLevel(projects: List[String]): List[(String, Int)] = {
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
        (level, count.toInt)
      }
    }
  }

  def countByLevelAndProject(projects: List[String]): Map[String, List[(String, Int)]] = {
    val byProjects = MongoDBObject("project" -> MongoDBObject("$in" -> projects))
    val mapFunction = """
    function() {
        emit({ level: this.level, project: this.project }, { count: 1 });
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

    val r = collection.mapReduce(
      mapFunction,
      reduceFunction,
      MapReduceInlineOutput,
      Some(byProjects)
    ).cursor.toList

    val results = r.flatMap { result =>
      for {
        id      <- result.getAs[DBObject]("_id")
        level   <- id.getAs[String]("level")
        project <- id.getAs[String]("project")
        value   <- result.getAs[DBObject]("value")
        count   <- value.getAs[Double]("count")
      } yield {
        (project, level -> count.toInt)
      }
    }

    results.groupBy{ case (project, _) => project }
           .map { case (project, r) =>
             project -> r.map(_._2)
           }
  }

  def create(stream: Enumerator[JsObject]): Future[Int] = {
    val adaptedStream = stream.map { json =>
      Log.writeForMongo.writes(json)
    }
    collectAsync.insert[JsObject](adaptedStream, 1)
  }

  def create(log: JsObject): Future[LastError] = {
    val mongoLog = Log.writeForMongo.writes(log)
    collectAsync.insert[JsValue](mongoLog)
  }

  def uncheckedCreate(log: JsObject) {
    val mongoLog = Log.writeForMongo.writes(log)
    collectAsync.uncheckedInsert(mongoLog)
  }

  def comment(id: ObjectId, comment: JsValue): Future[LastError] = {
    val byId = Json.obj("_id" -> Json.obj("$oid" -> id.toString))
    val toComments = Json.obj(
      "$push" -> Json.obj("comments" -> Comment.writeForMongo.writes(comment))
    )
    collectAsync.update[JsValue, JsValue](byId, toComments)
  }

  lazy val readFromWeb: Reads[LogFromWeb] = {
    (
      (__ \ 'project).read[String] and
      (__ \ 'logger).read[String] and
      (__ \ 'className).read[String] and
      (__ \ 'date).read[Date] and
      (__ \ 'file).read[String] and
      (__ \ 'location).read[String] and
      (__ \ 'line).read[Long] and
      (__ \ 'message).read[String] and
      (__ \ 'method).read[String] and
      (__ \ 'level).read[String] and
      (__ \ 'thread).read[String]
    ) tupled
  }

  lazy val writeForStream: OWrites[JsValue] = {
    import reactivemongo.bson.BSONObjectID
    def id = BSONObjectID.generate.stringify
    (
      (__).json.pick and
      (__ \ '_id).json.put(
        Writes[JsValue](_ => JsString(id))
      ) and
      (__ \ 'comments).json.put(Json.arr())
    ) join
  }

  lazy val writeForMongo: OWrites[JsValue] = {
    (
      (__).json.pick and
      (__ \ '_id).json.put(
        (__ \ '_id).json.pick.transform { json =>
          Json.obj("$oid" -> json \ "_id")
        }
      ) and
      (__ \ 'date).json.put(
        (__ \ 'date).json.pick.transform { json =>
          Json.obj("$date" -> json \ "date")
        }
      ) and Searchable.writeAsKeywords (__ \ 'message)
    ) join
  }

  val writeForWeb: OWrites[JsValue] = {
    (
      (__).json.pick and
      (__ \ '_id).json.put(
        (__ \ '_id).json.pick.transform { json =>
          json \ "_id" \ "$oid"
        }
      ) and
      (__ \ 'date).json.put(
        (__ \ 'date).json.pick.transform { json =>
          json \ "date" \ "$date"
        }
      )
    ) join
  }

  implicit object LogFormat extends Format[Log] {
    def reads(json: JsValue): JsResult[Log] = JsSuccess(Log(
      (json \ "_id").asOpt[String].map(new ObjectId(_)) getOrElse new ObjectId,
      (json \ "project").as[String],
      (json \ "logger").as[String],
      (json \ "className").as[String],
      (json \ "date").as[Date],
      (json \ "file").as[String],
      (json \ "location").as[String],
      (json \ "line").as[Long],
      (json \ "message").as[String],
      (json \ "method").as[String],
      (json \ "level").as[String],
      (json \ "thread").as[String],
      (json \ "comments").asOpt[Seq[Comment]] getOrElse Nil
    ))

    def writes(l: Log): JsValue = {
      Json.obj(
        "_id"       -> l._id.toString,
        "project"   -> l.project,
        "logger"    -> l.logger,
        "className" -> l.className,
        "date"      -> l.date.getTime,
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
