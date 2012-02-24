package actors

import play.api._
import play.api.libs.iteratee._
import play.api.libs.iteratee.Enumerator.Pushee

import play.api.libs.concurrent._
import play.api.Play.current
import akka.actor._
import akka.actor.Actor._

import models._

class StoryActor extends Actor {
  
  import StoryActor._

  private var projects: Map[String,Pushee[Log]] = Map.empty
  
  def receive = {
    case Listen(project: String) => {
      lazy val channel: Enumerator[Log] = Enumerator.pushee(
        pushee => self ! Init(project, pushee),
        onComplete = self ! Stop(project)
      )
      Logger.error("New debugging session for " + project)
      sender ! channel
    }

    case Init(project, pushee) => {
      projects += project -> pushee
    }

    case Stop(project: String) => {
      Logger.info("Debugging session has been stopped ...")
      projects = projects.filter(p => p._1 != project)
    }
    
    case NewLog(log: Log) => {
      Logger.info("Catch a log for " + log.project)
      LogDAO.insert(log)
      projects.filter(p => p._1 == log.project).map(p => p._2.push(log))
    }
  }
}

object StoryActor {
  import play.api.Play.current
  trait Event
  case class Listen(project: String) extends Event
  case class Stop(project: String) extends Event
  case class NewLog(log: Log)
  case class Init(project: String, p: Pushee[Log])
  lazy val system = ActorSystem("debugroom")
  lazy val ref = Akka.system.actorOf(Props[StoryActor])
}
