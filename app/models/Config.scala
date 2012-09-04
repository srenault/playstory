package models

import play.api.Logger
import play.api.Play
import play.api.Play.current

object Config {
  val isOffline: Boolean = Play.configuration.getBoolean("application.offline").getOrElse(false)

  object mongodb {
    lazy val limit : Int = {
      Play.configuration.getInt("mongodb.limit").getOrElse {
        Logger.warn("[PlayStoryConfig] mongodb.limit not found in the application.conf. Default value: 50")
        50
      }
    }
  }
}
