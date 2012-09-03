package models

import play.api.mvc._
import play.api.libs.json._
import play.api.libs.json.Json._

case class DashboardData(user: User, projects: List[JsValue]) {
  def userJson: String = toJson(user).toString
  def projectsJson: String = JsArray(projects).toString
}
