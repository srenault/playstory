package models

import com.novus.salat._
import com.novus.salat.global._
import com.novus.salat.annotations._
import com.novus.salat.dao._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection

import play.api.mvc.{ Request, AnyContent }
import play.Logger

case class User(
  lastname: String,
  firstname: String,
  email: String,
  language: String
)

object User {

  def byEmail(email: String): Option[User] =  UserDAO.findOne(MongoDBObject("email" -> email))
  def authenticate(pseudo: String, password: String): Option[User] =
    UserDAO.findOne(MongoDBObject("pseudo" -> pseudo, "password" -> password))

  def create(user: User) = UserDAO.insert(user)
}

object UserDAO extends SalatDAO[User, Int](collection = MongoConnection()("playstory")("users"))
