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
  projects: Seq[Project]
) {

  def fullName = firstname + " " + lastname

  def follow(project: Project) = {
    projects.find(pj => pj.name == project.name)
            .ifNone(User.follow(_id, project))
  }

  def isFollowProject(project: String): Boolean =
    projects.find(_.name == project).isDefined

  def asMongoDBObject: MongoDBObject = {
    val user = MongoDBObject.newBuilder
    user += "_id" -> _id
    user += "lastname" -> lastname
    user += "firstname" -> firstname
    user += "email" -> email
    user += "language" -> language
    user += "avatar" -> avatar
    user += "projects" -> projects
    user.result
  }
}

object User extends MongoDB("users") {

  def apply(lastname: String, firstname: String, email: String, language: String, avatar: Option[String] = None, projects: Seq[Project] = Nil): User = {
    User(new ObjectId, lastname, firstname, email, language, avatar, projects)
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

  def follow(id: ObjectId, project: Project) = {
    collection.update(MongoDBObject("_id" -> id), $push("projects" -> project.asMongoDBObject))
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
      val projects = user.getAs[BasicDBList]("projects")
                         .getOrElse(new BasicDBList()).flatMap {
         case p: DBObject => Project.fromMongoDBObject(p)
      }
      User(_id, lastname, firstname, email, language, avatar, projects)
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
      (json \ "projects").as[Seq[Project]]
    )

    def writes(user: User) = JsObject(Seq(
      "id" -> JsString(user._id.toString),
      "lastname" -> JsString(user.lastname),
      "firstname" -> JsString(user.firstname),
      "email" -> JsString(user.email),
      "language" -> JsString(user.language),
      "avatar" -> toJson(user.avatar),
      "projects" -> toJson(user.projects)
    ))
  }
}
