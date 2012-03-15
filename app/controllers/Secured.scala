package controllers

import play.api.mvc.Results._
import play.api.mvc._

import models.User

trait Secured {

  def Authenticated(securedAction: AuthenticatedRequest => Result) = Security.Authenticated(
    requestHeader => Some("popo"),//TODO requestHeader.session.get("pseudo"),
    requestHeader => askSignIn)(pseudo => Action { request =>
      User.byPseudo(pseudo).map { u =>
        securedAction(AuthenticatedRequest(u, request))
      }.getOrElse(askSignIn)
    })

  def askSignIn = Redirect(routes.Application.signin)
}

case class AuthenticatedRequest(user: User, request: Request[AnyContent]) extends WrappedRequest(request)

