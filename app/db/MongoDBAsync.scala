package db

import play.api.Play
import play.api.Play.current

import reactivemongo.api._
import reactivemongo.bson._
import reactivemongo.bson.handlers.DefaultBSONHandlers._

import play.api.libs.iteratee.Iteratee

object MongoDBAsync {

  import scala.concurrent.ExecutionContext.Implicits.global

  lazy val db = {
    val config   = Play.configuration
    val host     = config.getString("mongo.host").get
    val port     = config.getInt("mongo.port").get
    val dbName   = config.getString("mongo.db").get
    val username = config.getString("mongo.username").getOrElse("")
    val password = config.getString("mongo.password").getOrElse("")

    val co = MongoConnection(List(host + ":" + port))
    val database = DB(dbName, co)

    database.authenticate(username, password)
    database
  }
}

class MongoDBAsync(collectName: String, indexes: Seq[String] = Nil) {
  import MongoDB._

  lazy val collection = MongoDB.db(collectName)
  indexes.foreach(index => collection.ensureIndex(index))
}
