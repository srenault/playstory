package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import validation.Constraints._

import models.User
import models.UserDAO

object Application extends Controller {

  def index = Action {
    Ok(views.html.index(signinForm, signupForm))
  }

  val signinForm = Form[(String, String)](
    tuple(
      "email" -> email,
      "password" -> nonEmptyText
    )
  )

  def signin = Action { implicit request =>
    signinForm.bindFromRequest.fold(
      error => Unauthorized("Please fill correctly pseudo and password"),
      {
        case (pseudo, password) => User.authenticate(pseudo, password).map { u=>
          play.Logger.info("Authentication successful.")
          Redirect(routes.Story.index("onconnect"))
        }.getOrElse(Unauthorized("Authentication failed"))
      }
    )
  }

  def signout = Action {
    Ok
  }

  val signupForm = Form[User](
    mapping(
      "pseudo" -> nonEmptyText,
      "password" -> nonEmptyText,
      "email" -> email
    )(User.apply)(User.unapply)
  )

  def signup = Action { implicit request =>
    signupForm.bindFromRequest.fold(
      error => BadRequest("Please fill correctly pseudo, password and email"),
      {
        case u: User => UserDAO.insert(u)
        Redirect(routes.Story.index("onconnect"))
      }
    )
  }
}
