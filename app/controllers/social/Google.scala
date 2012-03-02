package controllers

import play.api._
import play.api.libs.ws._
import play.api.libs.concurrent._
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action, Request, AnyContent}

import play.api.Play.current

object Google extends Controller {

  private val URL_CONTACTS = "https://www.google.com/m8/feeds/contacts/default/full"

  def signIn() = Action { implicit request =>
    GoogleOAuth.signInURL.map { url =>
      SeeOther(url)
    }.getOrElse(InternalServerError)
  }
  
  def signInCallback(code: Option[String], error: Option[String]) = Action { implicit request =>
    code.map { authorizeToken =>
      GoogleOAuth.accessToken(authorizeToken).map { response =>
        response.onRedeem { accessToken =>
          Logger.debug("access token " + Json.parse(accessToken.body) \ "access_token")
          Logger.debug("access token " + Json.stringify(accessToken.json \ "access_token"))
          contacts(Json.stringify(accessToken.json \ "access_token"))
        }
      }
      Ok
    }.getOrElse(Unauthorized(error.getOrElse("Reason undefined")))
  }

  def contacts(accessToken: String) = Action {
    Logger.debug("Getting gmail contacts list")
    WS.url(URL_CONTACTS).withQueryString("access_token" -> accessToken).get.orTimeout("Ooppss", 1000).map { r =>
      Logger.debug("got a response")
      //r.xml
    }
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
  private val URL_ACCESS_TOKEN =  "https://accounts.google.com/o/oauth2/token"
  private val SCOPE_CONTACTS   =  "https://www.google.com/m8/feeds"

  def signInURL(implicit request: Request[AnyContent]): Option[String] = {
    APP_ID.map { id =>
      URL_AUTHORIZE + "?"+
      "response_type=code" +
      "&client_id=" + id +
      "&scope="+ SCOPE_CONTACTS +
      "&redirect_uri=" + callbackURL
    }.orElse(None)
  }

  def callbackURL(implicit request: Request[AnyContent]): String = "http://" + request.host + "/story/share/google/callback"

  def accessToken(authorizationCode: String)(implicit request: Request[AnyContent]): Option[Promise[Response]] = {
    (for {
      id <- APP_ID
      secret <- APP_SECRET
    } yield {
      WS.url(URL_ACCESS_TOKEN).post {
        Map(
          "grant_type" -> Seq("authorization_code"),
          "code"      -> Seq(authorizationCode),
          "client_id" -> Seq(id),
          "client_secret" -> Seq(secret),
          "redirect_uri" -> Seq(callbackURL)
        )
      }
    }).orElse(None)
  }
}
