package models

import scalaz.OptionW
import scalaz.Scalaz._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.{ Request, AnyContent }
import play.Logger
import db.MongoDB

case class User(
  _id: ObjectId,
  lastname: String,
  firstname: String,
  email: String,
  language: String,
  avatar: Option[String],
  projectNames: Seq[String],
  bookmarkIds: Seq[ObjectId]
) {

  lazy val bookmarks: Seq[Log] = Log.byIds(bookmarkIds)

  def fullName = firstname + " " + lastname

  def projects: Seq[Project] = projectNames.flatMap { projectName =>
    Project.byName(projectName)
  }

  def follow(project: Project) = {
    projectNames.find(pj => pj == project.name)
                .ifNone(User.follow(_id, project.name))
  }

  def bookmark(logId: ObjectId) {
    User.bookmark(_id, logId)
  }

  def isFollowProject(project: String): Boolean =
    projectNames.find(_ == project).isDefined

  def asMongoDBObject: MongoDBObject = {
    val user = MongoDBObject.newBuilder
    user += "_id" -> _id
    user += "lastname" -> lastname
    user += "firstname" -> firstname
    user += "email" -> email
    user += "language" -> language
    user += "avatar" -> avatar
    user += "projects" -> projectNames
    user += "bookmarkIds" -> bookmarkIds
    user.result
  }
}

object User extends MongoDB("users") {

  def apply(lastname: String,
            firstname: String,
            email: String,
            language: String,
            avatar: Option[String] = None,
            projects: Seq[String] = Nil,
            bookmarkIds: Seq[ObjectId] = Nil): User = {
    User(new ObjectId, lastname, firstname, email, language, avatar, projects, bookmarkIds)
  }

  def assignAvatar(user: User): User = {
    user.email match {
      case "srenault.contact@gmail.com" => user.copy(avatar = Some("/assets/images/avatars/srenault.contact@gmail.com.png"))
      case _ => user.copy(avatar = Some("/assets/images/avatars/sre@zenexity.com.png"))
    }
  }

  def anonymous: User = User("anonymous", "anonymous", "anonymous@unknown.com", "en")

  def byId(id: ObjectId): Option[User] =
    findOne("_id" -> id).flatMap(User.fromMongoDBObject(_))

  def byEmail(email: String): Option[User] =
    findOne("email" -> email).flatMap(User.fromMongoDBObject(_))

  def authenticate(pseudo: String, password: String): Option[User] =
    findOne("pseudo" -> pseudo, "password" -> password).flatMap(User.fromMongoDBObject(_))

  def create(user: User) = save(user.asMongoDBObject)

  def createIfNot(user: User) =
    byEmail(user.email).ifNone(save(assignAvatar(user).asMongoDBObject))

  def follow(id: ObjectId, project: String) = {
    collection.update(MongoDBObject("_id" -> id), $push("projects" -> project))
  }

  def bookmark(id: ObjectId, logID: ObjectId) {
    collection.update(MongoDBObject("_id" -> id), $push("bookmarkIds" -> logID))
  }

  def fromMongoDBObject(user: MongoDBObject): Option[User] = {
    for {
      _id       <- user.getAs[ObjectId]("_id")
      lastname  <- user.getAs[String]("lastname")
      firstname <- user.getAs[String]("firstname")
      email     <- user.getAs[String]("email")
      language  <- user.getAs[String]("language")
    } yield {
      val avatar = user.getAs[String]("avatar")
      val projects = user.as[BasicDBList]("projects").toList.map {
        case project: String => project
      }
      val bookmarkIds = user.as[BasicDBList]("bookmarkIds").toList.map {
        case logID: ObjectId => logID
      }
      User(_id, lastname, firstname, email, language, avatar, projects, bookmarkIds)
    }
  }

  implicit object UserFormat extends Format[User] {
    def reads(json: JsValue) = User(
      (json \ "id").asOpt[String].map(id => new ObjectId(id)).getOrElse(new ObjectId),
      (json \ "lastname").as[String],
      (json \ "firstname").as[String],
      (json \ "email").as[String],
      (json \ "language").as[String],
      (json \ "avatar").asOpt[String],
      (json \ "projects").as[Seq[String]],
      (json \ "bookmarkIds").as[Seq[String]].map(new ObjectId(_))
    )

    def writes(user: User) = JsObject(Seq(
      "id" -> JsString(user._id.toString),
      "lastname" -> JsString(user.lastname),
      "firstname" -> JsString(user.firstname),
      "email" -> JsString(user.email),
      "language" -> JsString(user.language),
      "avatar" -> toJson(user.avatar),
      "projects" -> toJson(user.projectNames),
      "bookmarkIds" -> toJson(user.bookmarkIds.map(l => JsString(l.toString)))
    ))
  }
}
