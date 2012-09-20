package controllers

import play.api.libs.concurrent._
import play.api.libs.concurrent.execution.defaultContext
import play.api.mvc.Results._
import play.api.mvc._
import play.Logger

import models.{ User, Config }

trait Secured {

  def Authenticated[R <: Result](securedAction: AuthenticatedRequest => R) = Security.Authenticated(
    requestHeader => if(Config.isOffline) Some("anonymous") else requestHeader.session.get("user"),
    requestHeader => askSignIn)(email => Action { request =>
      if(!Config.isOffline) {
        Logger.info("You aren't in an offline mode.")
        User.byEmail(email).map { maybeUser =>
          for {
            jsonUser <- maybeUser
            user     <- jsonUser.asOpt[User]
          } yield {
            securedAction(AuthenticatedRequest(User.assignAvatar(user), request))
          }
        }.await match {
          case Redeemed(Some(r)) => r
          case Redeemed(None) => {
            Logger.warn("[Secured] Failed to get user with : " + email)
            askSignIn
          }
          case Thrown(e) => {
            Logger.warn("[Secured] Failed to get user. Request failed: " + e.getMessage)
            askSignIn
          }
        }
      } else {
        Logger.warn("You are in an offline mode !")
        securedAction(AuthenticatedRequest(User.anonymous, request))
      }
    })

  def askSignIn = Redirect(routes.Application.signin)
}

case class AuthenticatedRequest(user: User, request: Request[AnyContent]) extends WrappedRequest(request)
