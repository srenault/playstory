package models

import scala.concurrent.Future
import scalaz.OptionW
import scalaz.Scalaz._
import play.Logger
import play.api.libs.concurrent._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.{ Request, AnyContent }
import play.modules.reactivemongo.PlayBsonImplicits.{ JsValueWriter, JsValueReader }
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import reactivemongo.core.commands.LastError
import reactivemongo.api.SortOrder.{ Ascending, Descending }
import utils.reactivemongo._
import utils.reactivemongo.{ QueryBuilder => JsonQueryBuilder }
import db.MongoDB

case class User(
  _id: ObjectId,
  lastname: String,
  firstname: String,
  email: String,
  language: String,
  avatar: Option[String],
  projectNames: List[String],
  bookmarkIds: List[ObjectId]
) {

  lazy val bookmarks: Seq[Log] = Log.byIds(bookmarkIds)

  lazy val bookmarksAsync: Future[List[JsValue]] = Log.byIdsAsync(bookmarkIds)

  def fullName = firstname + " " + lastname

  def projects: Seq[Project] = projectNames.flatMap { projectName =>
    Project.byName(projectName)
  }

  def projectsAsync: Future[List[JsValue]] = Project.byNamesAsync(projectNames:_*)

  def follow(project: Project) = {
    projectNames.find(pj => pj == project.name)
                .ifNone(User.follow(_id, project.name))
  }

  def followAsync(projectName: String)= {
    val followedProjects = projectNames.find(_ == projectName)
    User.followAsync(_id, projectName)
  }

  def hasBookmark(logId: ObjectId): Boolean = bookmarkIds.find(_ == logId).isDefined

  def bookmark(logId: ObjectId) {
    User.bookmark(_id, logId)
  }

  def bookmarkAsync(keptLog: ObjectId) = User.bookmarkAsync(_id, keptLog)

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
            projects: List[String] = Nil,
            bookmarkIds: List[ObjectId] = Nil): User = {
    User(new ObjectId, lastname, firstname, email, language, avatar, projects, bookmarkIds)
  }

  def assignAvatar(user: User): User = {
    user.email match {
      case "srenault.contact@gmail.com" => user.copy(avatar = Some("/assets/images/avatars/srenault.contact@gmail.com.png"))
      case _ => user.copy(avatar = Some("/assets/images/avatars/sre@zenexity.com.png"))
    }
  }

  def anonymous: User = User("anonymous", "anonymous", "anonymous@unknown.com", "en")

  def byId(id: ObjectId): Option[User] = {
    val byId = MongoDBObject("_id" -> id)
    collection.findOne(byId).flatMap(User.fromMongoDBObject(_))
  }

  def byIdAsync(id: ObjectId): Future[Option[JsValue]] = {
    val byId = Json.obj("_id" -> Json.obj("$oid" -> id.toString))
    val jsonQuery = JsonQueryBuilder().query(byId)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def byEmail(email: String): Option[User] = {
    val byEmail = MongoDBObject("email" -> email)
    collection.findOne(byEmail).flatMap(User.fromMongoDBObject(_))
  }

  def byEmailAsync(email: String): Future[Option[JsValue]] = {
    val byEmail = Json.obj("email" -> email)
    val jsonQuery = JsonQueryBuilder().query(byEmail)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def authenticate(pseudo: String, password: String): Option[User] = {
    val byPseudo = MongoDBObject("pseudo" -> pseudo)
    val byPassword = MongoDBObject("password" -> password)
    collection.findOne(byPseudo ++ byPassword).flatMap(User.fromMongoDBObject(_))
  }

  def authenticateAsync(pseudo: String, password: String): Future[Option[JsValue]] = {
    val byPseudo = Json.obj("pseudo" -> pseudo)
    val byPassword = Json.obj("password" -> password)
    val jsonQuery = JsonQueryBuilder().query(byPseudo ++ byPassword)
    JsonQueryHelpers.find(collectAsync, jsonQuery).headOption
  }

  def create(user: User) = collection += user.asMongoDBObject

  def createAsync(user: JsValue) = collectAsync.insert[JsValue](user)

  def createIfNot(user: User) = byEmail(user.email).ifNone {
    collection += (assignAvatar(user).asMongoDBObject)
  }

  def createIfNotAsync(user: JsValue): Future[Option[LastError]] = {
    val email: String = (user \ "email").as[String]
    byEmailAsync(email).flatMap { userOpt =>
      userOpt.map(_ => Promise.pure(None)) getOrElse createAsync(user).map(Some(_))
    }
  }

  def follow(id: ObjectId, project: String) = {
    collection.update(MongoDBObject("_id" -> id), $push("projects" -> project))
  }

  def followAsync(id: ObjectId, project: String) = {
    val byId = Json.obj("_id" -> Json.obj("$oid" -> id.toString))
    val toProjects = Json.obj("$push" -> Json.obj("projects" -> project))
    collectAsync.update[JsValue, JsValue](byId, toProjects)
  }

  def bookmark(id: ObjectId, logID: ObjectId) {
    collection.update(MongoDBObject("_id" -> id), $push("bookmarkIds" -> logID))
  }

  def bookmarkAsync(id: ObjectId, keptLog: ObjectId): Future[LastError] = {
    val byId = Json.obj("_id" -> Json.obj("$oid" -> id.toString))
    val keptLogId = Json.obj("$oid" -> keptLog.toString)
    val newBookmark = Json.obj("$push" -> Json.obj("bookmarkIds" -> keptLogId))
    collectAsync.update[JsValue, JsValue](byId, newBookmark)
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
      (json \ "projects").as[List[String]],
      (json \ "bookmarkIds").as[List[String]].map(new ObjectId(_))
    )

    def writes(user: User) = Json.obj(
      "id" -> user._id.toString,
      "lastname" -> user.lastname,
      "firstname" -> user.firstname,
      "email" -> user.email,
      "language" -> user.language,
      "avatar" -> user.avatar,
      "projects" -> user.projectNames,
      "bookmarkIds" -> JsArray(user.bookmarkIds.map(l => Json.obj("$oid" -> l.toString)))
    )
  }
}
