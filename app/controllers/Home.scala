package controllers

import play.api._
import play.api.mvc._

object Home extends Controller with Secured {

  def projects() = Authenticated { implicit request =>
    Ok
  }

  def createProject(project: String) = Authenticated { implicit request =>
    Ok
  }

  def follow(project: String) = Authenticated { implicit request =>
    Ok
  }

  def unfollow(project: String) = Authenticated { implicit request =>
    Ok
  }

  def changeAvatar() = Authenticated { implicit request =>
    Ok
  }

  def summary() = Authenticated { implicit request =>
    Ok
  }
}
