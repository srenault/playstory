package db

import scala.concurrent.{ExecutionContext, Future}

import play.api.Play
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.Play.current
import play.modules.reactivemongo._

import reactivemongo.api._
import reactivemongo.bson._
import reactivemongo.bson.handlers._
import reactivemongo.bson.handlers.DefaultBSONHandlers._

import play.api.libs.iteratee.Iteratee

class MongoDBAsync(collectName: String, indexes: Seq[String] = Nil) {
  import MongoDB._

  implicit val ec: ExecutionContext = ExecutionContext.Implicits.global

  lazy val collectAsync = ReactiveMongoPlugin.collection(collectName)
  //indexes.foreach(index => collection.ensureIndex(index))
}

case class InsertException(message: String) extends Exception {
  override def getMessage() = "Failed inserting the following document in the database: \n" + message
}
