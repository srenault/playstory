package controllers

import play.api.mvc.Results._
import play.api.mvc._

import models.User

trait Secured {

  def Authenticated(securedAction: AuthenticatedRequest => Result) = Security.Authenticated(
    requestHeader => requestHeader.session.get("user"),
    requestHeader => askSignIn)(email => Action { request =>
      User.byEmail(email).map { u =>
        securedAction(AuthenticatedRequest(u, request))
      }.getOrElse(askSignIn)
    })

  def askSignIn = Redirect(routes.Application.index)
}

case class AuthenticatedRequest(user: User, request: Request[AnyContent]) extends WrappedRequest(request)

