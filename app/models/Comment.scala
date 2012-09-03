package models

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import db.MongoDB

case class Comment(_id: ObjectId, author: ObjectId, message: String)

object Comment {

  def apply(author: ObjectId, message: String): Comment = {
    Comment(new ObjectId, author, message)
  }

  implicit object CommentFormat extends Format[Comment] {
    def reads(json: JsValue) = Comment(
      (json \ "id").asOpt[String].map(id => new ObjectId(id)).getOrElse(new ObjectId),
      new ObjectId((json \ "author").as[String]),
      (json \ "message").as[String]
    )

    def writes(comment: Comment) = Json.obj(
      "id"      -> Json.obj("$oid" -> comment._id.toString),
      "author"  -> Json.obj("$oid" -> comment.author.toString),
      "message" -> comment.message
    )
  }
}
