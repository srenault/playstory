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
    Logger.info("Getting authorization code " + code + " error: " + error)
    code.map { authorizeToken => //use flatmap ?
      GoogleOAuth.accessToken(authorizeToken).map { accessToken =>
        accessToken.await.fold(
           failed => Unauthorized("Failed getting access token: " + failed.getMessage),
           accessToken => (accessToken.json \ "access_token").asOpt[String].map { ac =>
              Ok.withSession("access_token" -> ac)
           }.getOrElse(Unauthorized("Failed getting access token: cannot parse token in :" + accessToken.json))
        )
      }.getOrElse(Unauthorized("Failed getting access token. Be sure to have id & secret client in application.conf"))
     }.getOrElse(Unauthorized(error.getOrElse("Failed getting authorization code")))
  }

  def contacts() = Action { implicit request =>
    Logger.info("Getting gmail contacts list")
    request.session.get("access_token").map { accessToken =>
      WS.url(URL_CONTACTS).withQueryString("access_token" -> accessToken).get.await.fold(
        failed => InternalServerError(failed.getMessage),
        cts => {
          Logger.debug(cts.body)
          Ok(cts.xml)
        }
      )
    }.getOrElse(InternalServerError("No access token in the user session"))
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
