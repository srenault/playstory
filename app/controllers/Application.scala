package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._
import play.api.libs.openid.OpenID

import models.User
import models.UserDAO

object Application extends Controller {

  def index = Action { implicit request =>
    Logger.info("Welcome unauthenticated user !")
    Ok(views.html.signin())
  }

  def signin = Action { implicit request =>
    Logger.info("[OpenID] Starting OAuth process...")
    OpenID.redirectURL("https://www.google.com/accounts/o8/id",
                        routes.Application.signinCallback.absoluteURL(),
                        Seq(
                          ("email", "http://axschema.org/contact/email"),
                          ("firstname", "http://axschema.org/namePerson/first"),
                          ("lastname", "http://axschema.org/namePerson/last"),
                          ("language", "http://axschema.org/pref/language")
                        )).await.fold (
      error => Redirect(routes.Application.index),
      url => Redirect(url)
    )
  }

  def signinCallback = Action { implicit request =>
    Logger.info("[OpenID] Receiving user info...")
    OpenID.verifiedId.await.fold (
      error => {
        Logger.info("[OpenID] Authentication failed")
        Redirect(routes.Application.index)
      },
      userInfo => {
        (for {
          lastname  <- userInfo.attributes.get("lastname")
          firstname <- userInfo.attributes.get("firstname")
          email     <- userInfo.attributes.get("email")
          language  <- userInfo.attributes.get("language")
        } yield {
          User.create(User(lastname, firstname, email, language))
          Logger.info("[OpenID] Authentication successful")
          Redirect(routes.Story.home).withSession("user" -> email)
        }) getOrElse {
          Logger.info("[OpenID] Authentication successful but some required fields miss")
          Redirect(routes.Application.index)
        }
      }
    )
  }

  def signout = Action {
    Logger.info("Bye bye !")
    Redirect(routes.Application.index) withNewSession
  }
}
