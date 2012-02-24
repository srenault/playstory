package actors

import play.api._
import play.api.libs.iteratee._
import play.api.libs.iteratee.Enumerator.Pushee

import play.api.libs.concurrent._
import play.api.Play.current
import akka.actor._
import akka.actor.Actor._

import models.Log

class StoryActor extends Actor {
  
  import StoryActor._

  private var logs: Option[Pushee[Log]] = None
  
  def receive = {
    case Listen() => {
      lazy val channel: Enumerator[Log] = Enumerator.pushee(
        pushee => self ! Init(pushee),
        onComplete = self ! Quit()
      )
      Logger.error("New debugging session")
      sender ! channel
    }

    case Init(pushee) => {
      logs = Some(pushee)
    }

    case Quit() => {
      Logger.info("Debugging session has been stopped ...")
      logs=None
    }
    
    case NewLog(log) => {
      Logger.info("Catch a log")
      logs.map(_.push(log))
    }
  }
}

object StoryActor {
  import play.api.Play.current
  trait Event
  case class Listen() extends Event
  case class Quit() extends Event
  case class NewLog(log: Log)
  case class Init(p: Pushee[Log])
  lazy val system = ActorSystem("debugroom")
  lazy val ref = Akka.system.actorOf(Props[StoryActor])
}
