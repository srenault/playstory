package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._
import play.api.libs.openid.OpenID
import play.api.libs.concurrent._
import play.api.libs.concurrent.execution.defaultContext
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.iteratee._

import models.User

object Application extends Controller with GoogleOpenID {

  def index = Action { implicit request =>
    Logger.info("Welcome unauthenticated user !")
    Ok(views.html.signin())
  }

  def signin = Action { implicit request =>
    signinWithGoogle(
      routes.Application.signinCallback.absoluteURL(),
      url => Redirect(url),
      error => {
        Logger.error("[OpenID] Failed to sign in with Google")
        Redirect(routes.Application.index)
      }
    )
  }

  def signinCallback = Action { implicit request =>
    Logger.info("[OpenID] Receiving user info...")
    Async {
      OpenID.verifiedId.orTimeout("Failed authenticating to google openid", 1000).map { maybeUserInfo =>
        maybeUserInfo.fold(
          userInfo => {
            (for {
              lastname  <- userInfo.attributes.get("lastname")
              firstname <- userInfo.attributes.get("firstname")
              email     <- userInfo.attributes.get("email")
              language  <- userInfo.attributes.get("language")
            } yield {
              User.createIfNot(User(lastname, firstname, email, language))
              Logger.info("[OpenID] Authentication successful")
              Redirect(routes.Story.home).withSession("user" -> email)
            }) getOrElse {
              Logger.info("[OpenID] Authentication successful but some required fields miss")
              Redirect(routes.Application.index)
            }
          },
          error => {
            Logger.info("[OpenID] Authentication failed")
            Redirect(routes.Application.index)
          }
        )
      }
    }
  }

  def signout = Action {
    Logger.info("Bye bye !")
    Redirect(routes.Application.index) withNewSession
  }
}
