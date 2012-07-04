package db

import play.api.Play
import play.api.Play.current
import com.mongodb.casbah.Imports._

object MongoDB {

  val DB_NAME = Play.configuration.getString("mongo.db").get

  lazy val db = {
    val config   = Play.configuration
    val host     = config.getString("mongo.host").get
    val port     = config.getInt("mongo.port").get
    val dbName   = config.getString("mongo.db").get
    val username = config.getString("mongo.username").getOrElse("")
    val password = config.getString("mongo.password").getOrElse("")

    val co = MongoConnection(host, port)
    val database = co(dbName)
    database.authenticate(username, password)
    database
  }

  def clearAll() = db.dropDatabase()
}

class MongoDB(collectName: String) {
  import MongoDB._

  val collection = MongoDB.db(collectName)

  def findOne(filters: Tuple2[String, _]*) = {
    val query  = MongoDBObject.newBuilder ++= filters
    db(collectName).findOne(query.result)
  }

  def find(max: Int, filters: Tuple2[String, _]*) = {
    val query  = MongoDBObject.newBuilder ++= filters
    db(collectName).find(query.result).limit(max).toList
  }

  def find(max: Int, sort: MongoDBObject, filters: Tuple2[String, _]*) = {
    val query  = MongoDBObject.newBuilder ++= filters
    db(collectName).find(query.result).limit(max).sort(sort).toList
  }

  def save(model: MongoDBObject) = db(collectName) += model
}
