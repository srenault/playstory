package controllers

import play.api._
import play.api.libs.ws._
import play.api.libs.concurrent._
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action, Request, AnyContent, Result}
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.libs.openid.OpenID
import play.api.Play.current
import models.User

trait GoogleOpenID {
  self: Controller =>

  def signinWithGoogle(callback: String, success: String => Result, error: Throwable => Result) = {
    OpenID.redirectURL("https://www.google.com/accounts/o8/id",
                        callback,
                        Seq(
                          ("email", "http://axschema.org/contact/email"),
                          ("firstname", "http://axschema.org/namePerson/first"),
                          ("lastname", "http://axschema.org/namePerson/last"),
                          ("language", "http://axschema.org/pref/language")
                        )).await.fold (
      failed => error(failed),
      url => success(url)
    )
  }
}
