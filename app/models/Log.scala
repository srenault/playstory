package models

import play.Logger
import play.api.libs.json._
import play.api.libs.json.Json._


import java.util.Date

case class Log(logger: String,
               file: String,
               date: String,
               location: String,
               line: Long,
               message: String,
               method: String,
               level: String,
               thread: String,
               receivedAt: Long = new Date().getTime())

object Log {
  def fromJsObject(json: JsObject) = fromJson[Log](json)

  import play.api.libs.json.Generic._
  implicit val LogFormat: Format[Log] = productFormat10("logger", "file", "date", "location", "line", "message", "method", "level", "thread", "receivedAt")(Log.apply)(Log.unapply(_))
}
