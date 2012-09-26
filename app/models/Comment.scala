package models

import scala.concurrent.Future
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.json.util._
import play.api.libs.concurrent.execution.defaultContext
import db.MongoDB

case class Comment(_id: ObjectId, author: User, message: String)

object Comment {

  def apply(author: User, message: String): Comment = {
    Comment(new ObjectId, author, message)
  }

  def completeAuthor(author: User, comment: JsValue): JsValue =
    writeAuthor(toJson(author)).writes(comment)

  def writeAuthor(author: JsValue): Writes[JsValue] = {
    (
      (__).json.pick and
      (__ \ 'author).json.put(author)
    ) join
  }

  val writeForWeb: Writes[JsValue] = {
    (
      (__).json.pick and
      (__ \ "_id").json.put(
        (__ \ "_id").json.pick.transform { json =>
          json \ "_id" \ "$oid"
        }
      )
    ) join
  }

  val writeForMongo: Writes[JsValue] = {
    val id = new ObjectId
    (
      (__).json.pick and
      (__ \ "_id").json.put(
        Json.obj("$oid" -> id.toString)
      )
    ) join
  }

  implicit object CommentFormat extends Format[Comment] {
    def reads(json: JsValue): JsResult[Comment] = JsSuccess(Comment(
      (json \ "id").asOpt[String].map(id => new ObjectId(id)).getOrElse(new ObjectId),
      (json \ "author").as[User],
      (json \ "message").as[String]
    ))

    def writes(comment: Comment) = Json.obj(
      "id"      -> Json.obj("$oid" -> comment._id.toString),
      "author"  -> Json.obj("$oid" -> comment.author.toString),
      "message" -> comment.message
    )
  }
}
