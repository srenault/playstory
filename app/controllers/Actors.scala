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
        onComplete = () => self ! Stop(project),
        onError = { case(error, _) =>
          Logger.error("[Actor] Error during stream log for %s : %s".format(project,error)) 
        }
      )
      Logger.info("[Actor] New debugging session for " + project)
      sender ! channel
    }

    case Init(project, pushee) => {
      //if(projects.exists { case (proj, _) => proj == project}) {
        Logger.info("[Actor] New project added")
        projects += (project -> pushee)
    //} else {
      //Logger.warn("[Actor] Project already added")
      //}
    }

    case Stop(project: String) => {
      Logger.info("[Actor] Debugging session has been stopped ...")
      projects = projects.filter(p => p._1 != project)
    }
    
    case NewLog(log: Log) => {
        Project.createIfNot(Project(log.project))
      Log.create(log).map { createdLog =>
        projects.filter(p => p._1 == log.project).map(p => p._2.push(createdLog))
      }.orElse {
         Logger.warn("[Actor] Log not successfully persisted")
         None
      }
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
