package controllers

import play.api._
import play.api.mvc.{Controller, Action, Request, AnyContent, Result}
import play.api.libs.ws._
import play.api.libs.concurrent._
import play.api.libs.json.Json
import play.api.libs.concurrent.execution.defaultContext
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.openid.{ OpenID, OpenIDError }
import play.api.Play.current
import models.User

trait GoogleOpenID {
  self: Controller =>

  def signinWithGoogle[OpenIDError](callback: String, success: String => Result, error: Thrown => Result): Promise[Result] = {
    OpenID.redirectURL("https://www.google.com/accounts/o8/id",
                        callback,
                        Seq(
                          ("email", "http://axschema.org/contact/email"),
                          ("firstname", "http://axschema.org/namePerson/first"),
                          ("lastname", "http://axschema.org/namePerson/last"),
                          ("language", "http://axschema.org/pref/language")
                        )).extend1 {
      case Redeemed(url) => success(url)
      case e: Thrown => error(e)
    }
  }
}
