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
    Logger.info("Welcome unknown")
    Ok(views.html.index(signinForm, signupForm))
  }

  val signinForm = Form[(String, String)](
    tuple(
      "pseudo" -> nonEmptyText,
      "password" -> nonEmptyText
    )
  )

  def signin = Action { implicit request =>
    Logger.info("Authenticating user...")
    signinForm.bindFromRequest.fold(
      error => Unauthorized("Please fill correctly pseudo and password"),
      {
        case (pseudo, password) => User.authenticate(pseudo, password).map { u=>
          play.Logger.info("Authentication successful.")
          Redirect(routes.Story.home()).withSession("pseudo" -> pseudo)
        }.getOrElse(Unauthorized("Authentication failed"))
      }
    )
  }

  def signout = Action {
    Logger.info("Bye bye !")
    Ok //TODO
  }

  val signupForm = Form[(String, String, String)](
    tuple(
      "pseudo" -> nonEmptyText,
      "email" -> email,
      "password" -> nonEmptyText
    )
  )

  def signup = Action { implicit request =>
    Logger.info("Registering a new user")
    signupForm.bindFromRequest.fold(
      error => BadRequest("Please fill correctly pseudo, password and email"),
      {
        case (pseudo, email, password) => UserDAO.insert(User(pseudo, email, password))
        Ok(views.html.index(signinForm, signupForm))
      }
    )
  }
}
