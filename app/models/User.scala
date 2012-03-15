package models

import com.novus.salat._
import com.novus.salat.global._
import com.novus.salat.annotations._
import com.novus.salat.dao._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection

import play.api.mvc.{ Request, AnyContent }
import play.Logger

import db.MongoDB
import controllers.{ GoogleAPI, GoogleOAuth }
import controllers.GoogleOAuth.GoogleOAuthException

case class User(pseudo: String, email: String, password: String, refreshToken: Option[String]=None) {

  def saveRefreshToken(value: String): User = {
    UserDAO.update(MongoDBObject("pseudo" -> pseudo),
                   MongoDBObject("refresh_token" -> value), false, false)
    User(pseudo, email, password, Some(value))
  }

  def renewAccessToken(implicit request: Request[AnyContent]): Either[Throwable, String] = {
    refreshToken.map { rt =>
      GoogleOAuth.renewAccessToken(rt).await.fold(
        error => Left(error),
        accessToken => Right(accessToken)
      )
    }.getOrElse(Left(GoogleOAuthException("Renewing access token failed:  refreshToken is not specified: " + refreshToken)))
  }

  def contacts(accessToken: String, max: Int): Either[Throwable, Seq[Contact]] = {
    GoogleAPI.contacts(accessToken, max).await.fold(
      error => Left(error),
      contacts => {
        Right(
          (contacts \\ "entry").map { entry =>
           Contact((entry \ "title").text,
                  (entry \ "email" \ "@address").text)
          }
        )
      }
    )
  }
}

object User {

  def byPseudo(pseudo: String): Option[User] =  UserDAO.findOne(MongoDBObject("pseudo" -> pseudo))

  def authenticate(pseudo: String, password: String): Option[User] = {
    UserDAO.findOne(MongoDBObject("pseudo" -> pseudo, "password" -> password))
  }

  def create(user: User) = UserDAO.insert(user)
}

object UserDAO extends SalatDAO[User, Int](collection = MongoConnection()("playstory")("users"))
