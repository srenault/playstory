package controllers

import play.api.mvc.Results._
import play.api.mvc._
import play.Logger

import models.{ User, PlayStoryConfig }

trait Secured {

  def Authenticated(securedAction: AuthenticatedRequest => Result) = Security.Authenticated(
    requestHeader => if(PlayStoryConfig.isOffline) Some("anonymous") else requestHeader.session.get("user"),
    requestHeader => askSignIn)(email => Action { request =>
      if(!PlayStoryConfig.isOffline) {
        Logger.info("You aren't in an offline mode.")
        User.byEmail(email).map { u =>
          securedAction(AuthenticatedRequest(u, request))
        }.getOrElse(askSignIn)
      } else {
        Logger.warn("You are in an offline mode !")
        securedAction(AuthenticatedRequest(User.anonymous, request))
      }
    })

  def askSignIn = Redirect(routes.Application.index)
}

case class AuthenticatedRequest(user: User, request: Request[AnyContent]) extends WrappedRequest(request)

