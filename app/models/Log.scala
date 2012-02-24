package models

import play.Logger
import play.api.libs.json._
import play.api.libs.json.Json._

case class Log(logger: String,
               className: String,
               date: String,
               file: String,
               location: String,
               line: String,
               message: String,
               method: String,
               level: String,
               thread: String)

object Log {
  def fromJsObject(json: JsObject) = fromJson[Log](json)

  import play.api.libs.json.Generic._
  implicit val LogFormat: Format[Log] = productFormat10("logger", "class", "date", "file", "location", "line", "message", "method", "level", "thread")(Log.apply)(Log.unapply(_))
}
