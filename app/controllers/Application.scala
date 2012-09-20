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

import models.{ User, Project, DashboardData }

object Application extends Controller with GoogleOpenID with Secured {

  def signin = Action { implicit request =>
    Logger.info("Welcome unauthenticated user !")
    Ok(views.html.signin())
  }

  def index = Authenticated { implicit request =>
    Logger.info("Welcome authenticated user : " + request.user)
    Async {
      val project = Project("onconnect", "ONconnect", Some("/assets/images/avatars/onconnect.png"))
      Project.createIfNot(toJson(project))
      Project.all().map { projects =>
        Ok(views.html.playstory.index(
          request.user,
          DashboardData(request.user, projects)
        ))
      }
    }
  }

  def openid = Action { implicit request =>
    Async {
      signinWithGoogle(
        routes.Application.openidCallback.absoluteURL(),
        url => Redirect(url),
        error => {
            Logger.error("[OpenID] Failed to sign in with Google: " + error)
            Redirect(routes.Application.index)
        }
      )
    }
  }

  def openidCallback = Action { implicit request =>
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
              Redirect(routes.Application.index).withSession("user" -> email)
            }
            case Some(LastError(true, _, _, _, _)) => {
              Logger.info("[OpenID] Authentication successful - user created")
              Redirect(routes.Application.index).withSession("user" -> email)
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
