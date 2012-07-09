package models

import play.api.Play
import play.api.Play.current

object PlayStoryConfig {
  val isOffline: Boolean = Play.configuration.getBoolean("application.offline").getOrElse(false)
}
