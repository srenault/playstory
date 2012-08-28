package models

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import db.MongoDB

case class Comment(_id: ObjectId, author: ObjectId, message: String) {

  def asMongoDBObject: MongoDBObject = {
    val comment = MongoDBObject.newBuilder
    comment += "_id" -> _id
    comment += "author" -> author
    comment += "message" -> message
    comment.result
  }
}

object Comment {

  def apply(author: ObjectId, message: String): Comment = {
    Comment(new ObjectId, author, message)
  }

  implicit object MessageFormat extends Format[Comment] {

    def reads(json: JsValue) = Comment(
      (json \ "id").asOpt[String].map(id => new ObjectId(id)).getOrElse(new ObjectId),
      new ObjectId((json \ "author").as[String]),
      (json \ "message").as[String]
    )

    def writes(comment: Comment) = Json.obj(
      "id"      -> comment._id.toString,
      "author"  -> toJson(User.byId(comment.author)),
      "message" -> comment.message
    )
  }

  def fromMongoDBObject(comment: MongoDBObject): Option[Comment] = {
    for {
      _id     <- comment.getAs[ObjectId]("_id")
      author  <- comment.getAs[ObjectId]("author")
      message <- comment.getAs[String]("message")
    } yield {
      Comment(_id, author, message)
    }
  }
}
