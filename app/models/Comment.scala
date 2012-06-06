package models

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import db.MongoDB

case class Comment(message: String) {

  def asMongoDBObject: MongoDBObject = {
    val comment = MongoDBObject.newBuilder
    comment += "message" -> message
    comment.result
  }
}

object Comment {

  implicit object MessageFormat extends Format[Comment] {

    def reads(json: JsValue) = Comment(
      (json \ "message").as[String]
    )

    def writes(comment: Comment) = JsObject(Seq(
      "message" -> JsString(comment.message)
    ))
  }
}
