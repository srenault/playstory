package db

import scala.concurrent.{ExecutionContext, Future}

import play.api.Play
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.Play.current
import play.modules.reactivemongo._
import play.modules.reactivemongo.PlayBsonImplicits.{ JsValueWriter, JsValueReader }

import reactivemongo.api._
import reactivemongo.bson._
import reactivemongo.bson.handlers._
import reactivemongo.bson.handlers.DefaultBSONHandlers._

import play.api.libs.iteratee.Iteratee

class MongoDBAsync(collectName: String, indexes: Seq[String] = Nil) {
  import MongoDB._

  implicit val ec: ExecutionContext = ExecutionContext.Implicits.global

  lazy val collection = {
    val db = ReactiveMongoPlugin.db
    db(collectName)
  }

  val query: JsValue = Json.obj(
    "project" -> "onconnect"
  )

  val found = collection.find[JsValue, JsValue](query)
  found.toList.map { logs =>
    println("hey")
    println(logs.size)
  }

  //indexes.foreach(index => collection.ensureIndex(index))
}
