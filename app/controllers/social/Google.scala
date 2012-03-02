package controllers.social

import play.api._
import play.api.libs.ws._
import play.api.libs.concurrent._
import play.api.mvc.{Controller, Action, Request, AnyContent}

import play.api.Play.current

object Google extends Controller {

  private val URL_CONTACTS = "https://www.google.com/m8/feeds/contacts/default/full"

  def signIn() = Action { implicit request =>
    GoogleOAuth.signInURL.map { url =>
      SeeOther(url)
    }.getOrElse(InternalServerError)
  }
  
  def signInCallback(code: Option[String], error: Option[String]) = Action {
    code.map {ac =>
      GoogleOAuth.accessToken(ac)
      Ok
    }.getOrElse(Unauthorized(error.getOrElse("Reason undefined")))
  }

  def contacts = Action {
    WS.url(URL_CONTACTS).get
    Ok
  }

  def sendEmail = Action {
    Ok
  }
}

object GoogleOAuth {

  private val APP_ID           =  Play.configuration.getString("oauth.google.client.id")
  private val APP_SECRET       =  Play.configuration.getString("oauth.google.client.secret")
  private val URL_AUTHORIZE    =  "https://accounts.google.com/o/oauth2/auth"
  private val URL_ACCESS_TOKEN =  "https://www.google.com/m8/feeds"
  private val SCOPE_CONTACTS   =  "https://www.google.com/m8/feeds"

  def signInURL(implicit request: Request[AnyContent]): Option[String] = {
    APP_ID.map { id =>
      URL_AUTHORIZE + "?"+
                "response_type=code" +
                "&client_id=" + APP_ID +
                "&scope="+ SCOPE_CONTACTS +
                "&redirect_uri=" + callbackURL +
                "&grant_type=authorization_code"
    }.orElse(None)
  }

  def callbackURL(implicit request: Request[AnyContent]): String = {
    request.domain + "/"
  }

  def accessToken(accessToken: String): Promise[Response] = {
    WS.url(URL_ACCESS_TOKEN).withQueryString("access_token" -> accessToken).get
  }
}
