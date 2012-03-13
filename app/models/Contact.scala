package models

import play.api.libs.json._
import play.api.libs.json.Json._

case class Contact(title: String, email: String)

object Contact {
  import play.api.libs.json.Generic._
  implicit object ContactFormat extends Format[Contact] {
    def reads(json: JsValue): Contact = Contact(
      (json \ "title").as[String],
      (json \ "email").as[String]
    )

    def writes(c: Contact): JsValue = JsObject(Seq(
      "title" -> JsString(c.title),
      "email" -> JsString(c.email)
    ))
  }
}
