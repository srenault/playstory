package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._
import play.api.libs.openid.{ OpenID, OpenIDError }
import play.api.libs.concurrent._
import play.api.libs.concurrent.execution.defaultContext
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.iteratee._
import reactivemongo.core.commands.LastError

import models.User

object Application extends Controller with GoogleOpenID {

  def index = Action { implicit request =>
    Logger.info("Welcome unauthenticated user !")
    Ok(views.html.signin())
  }

  def home = Action { implicit request =>
    Ok(views.html.playstory.home.index())
  }

  def signin = Action { implicit request =>
    Async {
      signinWithGoogle(
        routes.Application.signinCallback.absoluteURL(),
        url => Redirect(url),
        error => {
            Logger.error("[OpenID] Failed to sign in with Google: " + error)
            Redirect(routes.Application.index)
        }
      )
    }
  }

  def signinCallback = Action { implicit request =>
    Logger.info("[OpenID] Receiving user info...")

    Async {
      OpenID.verifiedId.flatMap { userInfo =>
        (for {
          lastname  <- userInfo.attributes.get("lastname")
          firstname <- userInfo.attributes.get("firstname")
          email     <- userInfo.attributes.get("email")
          language  <- userInfo.attributes.get("language")
        } yield {
          val user = Json.obj("lastname" -> lastname, "firstname" -> firstname, "email" -> email, "language" -> language)
          User.createIfNot(user).map {
            case None => {
              Logger.info("[OpenID] Authentication successful: " + email)
              Redirect(routes.Dashboard.home).withSession("user" -> email)
            }
            case Some(LastError(true, _, _, _, _)) => {
              Logger.info("[OpenID] Authentication successful - user created")
              Redirect(routes.Dashboard.home).withSession("user" -> email)
            }
            case _ => {
              Logger.info("[OpenID] Authentication failed")
              Redirect(routes.Application.index)
            }
          }
        }) getOrElse {
          Logger.info("[OpenID] Authentication failed")
          Promise.pure(Redirect(routes.Application.index))
        }
      }
    }
  }

  def signout = Action {
    Logger.info("Bye bye !")
    Redirect(routes.Application.index) withNewSession
  }
}
