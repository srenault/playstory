package models

import com.novus.salat._
import com.novus.salat.global._
import com.novus.salat.annotations._
import com.novus.salat.dao._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.MongoConnection

import db.MongoDB

case class User(pseudo: String, email: String, password: String) {
  def refreshToken: Option[String] = None
}

object User {
  def byPseudo(pseudo: String): Option[User] =  UserDAO.findOne(MongoDBObject("pseudo" -> pseudo))
  def authenticate(pseudo: String, password: String): Option[User] = {
    UserDAO.findOne(MongoDBObject("pseudo" -> pseudo, "password" -> password))
  }
}

object UserDAO extends SalatDAO[User, Int](collection = MongoConnection()("playstory")("users"))
