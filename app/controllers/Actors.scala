package actors

import play.api._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.iteratee.Concurrent._
import play.api.Play.current
import akka.actor._
import akka.actor.Actor._
import scalaz.OptionW
import scalaz.Scalaz._

import models._

class StoryActor extends Actor {

  import StoryActor._

  private var projects: Map[String,Channel[Log]] = Map.empty

  private def pushToChannel(projectName: String, log: Log) = {

    projects.find(stream => stream._1 == Project.ALL).foreach {
      case (Project.ALL, channel) => {
        channel.push(log)
        Log.create(log)
      }
    }

    projects.find(stream => stream._1 == log.project).fold ({
      case (projectName, channel) => {
        channel.push(log)
        Log.create(log)
      }
    },
      Logger.warn("[Actor] Project doesn't exist")
    )
  }

  def receive = {
    case Listen(project: String) => {
      lazy val channel: Enumerator[Log] = Concurrent.unicast(
        channel => self ! Init(project, channel),
        onComplete = () => self ! Stop(project),
        onError = { case(error, _) =>
          Logger.error("[Actor] Error during stream log for %s : %s".format(project,error))
        }
      )
      Logger.info("[Actor] New stream for " + project)
      sender ! channel
    }

    case Init(project, channel) => {
        Logger.info("[Actor] New project added")
        projects += (project -> channel)
    }

    case Stop(project: String) => {
      Logger.info("[Actor] Stream %s has been stopped ...".format(project))
      projects = projects.filter(p => p._1 != project)
    }

    case NewLog(log: Log) => {
      Project.createIfNot(Project(log.project, log.project))
      pushToChannel(log.project, log)
    }
  }
}

object StoryActor {
  import play.api.Play.current
  trait Event
  case class Listen(project: String) extends Event
  case class Stop(project: String) extends Event
  case class NewLog(log: Log)
  case class Init(project: String, p: Channel[Log])
  lazy val system = ActorSystem("debugroom")
  lazy val ref = Akka.system.actorOf(Props[StoryActor])
}
