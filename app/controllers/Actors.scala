package actors

import akka.actor._
import akka.actor.Actor._

import play.api._
import play.api.libs.iteratee._
import play.api.libs.concurrent._

import models.Log

class StoryActor extends Actor {
  
  import StoryActor._
  
  private var logs: Option[CallbackEnumerator[Log]] = None
  
  def receive = {

    case Listen() => {
      lazy val channel: CallbackEnumerator[Log] = new CallbackEnumerator[Log](
        onComplete = self ! Quit()
      )
      logs = Some(channel)
      Logger.info("New debugging session")
      sender ! channel
    }

    case Quit() => {
      Logger.info("Debugging session has been stopped ...")
      logs=None
    }
    
    case NewLog(log) => {
      Logger.info("Got a log : " + log)
      logs.map(_.push(log))
    }
  }
}

object StoryActor {
  trait Event
  case class Listen() extends Event
  case class Quit() extends Event
  case class NewLog(log: Log)
  lazy val system = ActorSystem("debugroom")
  lazy val ref = system.actorOf(Props[StoryActor])
}
