import play.api._
import actors.StoryActor

object Global extends GlobalSettings {

  override def onStart(application:Application) {
    StoryActor.start
  }

  override def onStop(application:Application) {
  }
}
