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

  lazy val collection = MongoDB.db(collectName)
}
