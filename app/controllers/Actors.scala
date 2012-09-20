package actors

import play.api._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.iteratee.Concurrent._
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.json.Json._
import akka.actor._
import akka.actor.Actor._
import scalaz.OptionW
import scalaz.Scalaz._

import models._

class StoryActor extends Actor {

  import StoryActor._

  private var streams: Map[ChannelID, Channel[JsValue]] = Map.empty

  def receive = {

    case Listen(chanID) => {
      lazy val channel: Enumerator[JsValue] = Concurrent.unicast(
        channel => self ! Init(chanID, channel),
        onComplete = self ! Stop(chanID),
        onError = { case(error, _) =>
          Logger.error("[Actor] Error during streaming log for user %s on %s : %s".format(chanID._1, chanID._2, error))
        }
      )
      sender ! channel
    }

    case Init(chanID, channel) => {
      Logger.info("[Actor] Stream for user " + chanID._1 + " on project " + chanID._2)
      streams += chanID -> channel
    }

    case IsAlive() => streams.foreach {
        case (chanID, channel) => channel.push(Input.Empty)
    }

    case Stop(chanID) => {
      Logger.warn("[Actor] Stream for user %s on %s has been closed ...".format(chanID._1, chanID._2))
      streams = streams.filter {
        case (channelID, _) => chanID != channelID
      }
    }

    case NewLog(log: JsValue) => {
      Log.json.project(log).map { projectName =>
        pushToChannel(projectName, log)
      } getOrElse Logger.warn("[Actor] Failed getting project name from json")
    }
  }

  private def findChannels(wishProject: String): Option[Channel[JsValue]] = {
    println(wishProject)
    println(streams)
    streams.find {
      case ((_, Project.ALL), channel) => true
      case ((_, project), channel) => project == wishProject
    }.map {
      case(_, channel) => channel
    }
  }

  private def pushToChannel(project: String, log: JsValue) = {
    findChannels(project).foreach { channel =>
      println("push to channel")
      channel.push(log)
    }
  }
}

object StoryActor {
  import play.api.Play.current
  import akka.util.duration._

  type ChannelID = (String, String)
  sealed trait Event
  case class Listen(chanID: ChannelID) extends Event
  case class Stop(chanID: ChannelID) extends Event
  case class NewLog(log: JsValue)
  case class Init(chanID: ChannelID, p: Channel[JsValue])
  case class IsAlive()

  lazy val system = ActorSystem("storyroom")
  lazy val ref = Akka.system.actorOf(Props[StoryActor])

  def start = Akka.system.scheduler.schedule(1 second, 1 second) {
      StoryActor.ref ! IsAlive()
  }
}
