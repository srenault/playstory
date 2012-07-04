package models

import scalaz.OptionW
import scalaz.Scalaz._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection
import play.api.mvc.{ Request, AnyContent }
import play.Logger
import db.MongoDB

case class User(
  _id: ObjectId,
  lastname: String,
  firstname: String,
  email: String,
  language: String,
  projects: Seq[Project]
) {

  def fullName = firstname + " " + lastname

  def follow(project: Project) = {
    projects.find(pj => pj.name == project.name)
            .ifNone(User.follow(_id, project))
  }

  def asMongoDBObject: MongoDBObject = {
    val user = MongoDBObject.newBuilder
    user += "_id" -> _id
    user += "lastname" -> lastname
    user += "firstname" -> firstname
    user += "email" -> email
    user += "language" -> language
    user += "projects" -> projects
    user.result
  }
}

object User extends MongoDB("users") {

  def apply(lastname: String, firstname: String, email: String, language: String, projects: Seq[Project] = Nil): User = {
    User(new ObjectId, lastname, firstname, email, language, projects)
  }

  def fromMongoDBObject(user: MongoDBObject): Option[User] = {
    for {
      _id       <- user.getAs[ObjectId]("_id")
      lastname  <- user.getAs[String]("lastname")
      firstname <- user.getAs[String]("firstname")
      email     <- user.getAs[String]("email")
      language  <- user.getAs[String]("language")
    } yield {
      val projects = user.getAs[BasicDBList]("projects")
                         .getOrElse(new BasicDBList()).flatMap {
         case p: DBObject => Project.fromMongoDBObject(p)
      }
      User(_id, lastname, firstname, email, language, projects)
    }
  }

  def byEmail(email: String): Option[User] =
    findOne("email" -> email).flatMap(User.fromMongoDBObject(_))

  def authenticate(pseudo: String, password: String): Option[User] =
    findOne("pseudo" -> pseudo, "password" -> password).flatMap(User.fromMongoDBObject(_))

  def create(user: User) = save(user.asMongoDBObject)

  def follow(id: ObjectId, project: Project) = {
    collection.update(MongoDBObject("_id" -> id), $push("projects" -> project.asMongoDBObject))
  }
}
