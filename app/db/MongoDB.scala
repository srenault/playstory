package db

import play.Logger
import play.api.{ Configuration, Play }
import play.api.Play.current
import com.mongodb.casbah.Imports._

class MongoDB(tableName: String) {
  import MongoDB._

  def insert(model: MongoDBObject) = db(tableName) += model

  //def update(tableName: String, key: MongoDBObject, model: MongoDBObject) = db(tableName).findAndModify(key, model)

  //def remove(tableName: String, key: MongoDBObject, model: MongoDBObject) = db(tableName).findAndRemove(key, model)

  def count = db(tableName).count

  def clear() = db(tableName).dropCollection()

  def selectAll() = db(tableName).find()

  def selectBy(model: MongoDBObject) = db(tableName).find(model)

  def selectOne(model: MongoDBObject) = db(tableName).findOne(model)
}

object MongoDB {

  val DB_NAME = "playstory"

  val config = Play.configuration
  lazy val co: MongoConnection = {
    (for {
      host     <- config.getString("mongo.host")
      port     <- config.getInt("mongo.port")
    } yield {
      MongoConnection(host, port)
    }).getOrElse(throw new Exception("Failed creating MongoDB connexion. Be sure to correctly add db parameters in the application.conf file"))
  }

  lazy val db = {
    (for {
      username <- config.getString("mongo.username")
      password <- config.getString("mongo.password")
      dbName <- config.getString("mongo.db")
    } yield {
      val database = co(dbName)
      database.authenticate(username, password)
      database
    }).getOrElse(throw new Exception("Failed creating MongoDB connexion. Be sure to correctly add db parameters in the application.conf file"))
  }

  def clearAll() = db.dropDatabase()
}
