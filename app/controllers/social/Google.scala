package controllers

import play.api._
import play.api.libs.ws._
import play.api.libs.concurrent._
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action, Request, AnyContent}
import play.api.libs.json._
import play.api.libs.json.Json._

import play.api.Play.current
import models.User


object GoogleAPI {

  private val URL_CONTACTS = "https://www.google.com/m8/feeds/contacts/default/full"
  
  /*
   * Retrieve all gmail contacts.
   */
  def contacts(accessToken: String, max: Int): Promise[scala.xml.Elem] = {
    Logger.info("Getting gmail contacts list")
    var result = Promise[scala.xml.Elem]()
    WS.url(URL_CONTACTS).withQueryString("max-results" -> max.toString)
    .withQueryString("access_token" -> accessToken).get.await.fold(
      failed => result.redeem(throw GoogleOAuth.GoogleOAuthException(failed.getMessage)),
      cts => result.redeem(cts.xml)
    )
    result
  }
}

object Google extends Controller with Secured {

  private val ACCESS_TOKEN_JSON = "access_token"

  private def homePage = routes.Story.home()
  
  def signIn() = Action { implicit request =>
    GoogleOAuth.signInURL.map { url =>
      SeeOther(url)
    }.getOrElse(InternalServerError)
  }

  def signInCallback(code: Option[String], error: Option[String]) = Authenticated { implicit request =>
    Logger.info("Getting authorization code " + code + " error: " + error)
    code.map { authorizeToken =>
      GoogleOAuth.accessToken(authorizeToken).await.fold(
        error => {
          Logger.warn("Failed getting accessToken : " + error.getMessage());
          Unauthorized
        },
        tokens => tokens match {
          case (accessToken, None) => {
            Logger.info("AccessToken got : " + accessToken)
            Redirect(homePage).withSession("access_token" -> accessToken)
          }
          case (accessToken, Some(refreshToken)) => {
            Logger.info("AccessToken got : " + accessToken + " and refresh got : " + refreshToken)
            request.user.saveRefreshToken(refreshToken)
            Redirect(homePage).withSession("access_token" -> accessToken,
                                           "refresh_token" -> refreshToken)
          }
        }
      )
    }.getOrElse(Unauthorized(("Failed getting authorization code")))
  }

  def contacts = Authenticated { implicit request =>
    Logger.info("Getting contacts...")
    val accessToken = request.session.get("access_token")
    (for {
      at <- accessToken
    } yield {
      User.byEmail(request.user.email).map { user =>
        user.contacts(at, 100).fold(
          error => {
            Logger.warn("Failed getting contacts: error from google")
            InternalServerError
          },
          cts => Ok(toJson(cts))
        )
      }.getOrElse {
        Logger.warn("Failed getting contacts: Are you really login ?")
        InternalServerError
      }
    }).getOrElse {
      Logger.warn("Failed getting contacts: preconditions failed. accessToken => " + accessToken)
      InternalServerError
    }
  }
}

object GoogleOAuth {

  private val APP_ID           =  Play.configuration.getString("oauth.google.client.id")
  private val APP_SECRET       =  Play.configuration.getString("oauth.google.client.secret")
  private val URL_AUTHORIZE    =  "https://accounts.google.com/o/oauth2/auth"
  private val URL_ACCESS_TOKEN =  "https://accounts.google.com/o/oauth2/token"
  private val SCOPE_CONTACTS   =  "https://www.google.com/m8/feeds"

  case class GoogleOAuthException(message: String) extends Throwable

  def signInURL(implicit request: Request[AnyContent]): Option[String] = {
    play.Logger.info("Getting signin google URL...")
    APP_ID.map { id =>
      URL_AUTHORIZE + "?"+
      "response_type=code" +
      "&client_id=" + id +
      "&scope="+ SCOPE_CONTACTS +
      "&redirect_uri=" + callbackURL +
      "&access_type=offline"
    }.orElse(None)
  }

  def callbackURL(implicit request: Request[AnyContent]): String = "http://" + request.host + "/story/share/google/callback"

  def accessToken(authorizationCode: String)(implicit request: Request[AnyContent]): Promise[(String, Option[String])] = {
    Logger.info("Getting access token...")
    var result = Promise[(String, Option[String])]()
    (for {
      id <- APP_ID
      secret <- APP_SECRET
    } yield {
      WS.url(URL_ACCESS_TOKEN).post {
        Map(
          "grant_type"    -> Seq("authorization_code"),
          "code"          -> Seq(authorizationCode),
          "client_id"     -> Seq(id),
          "client_secret" -> Seq(secret),
          "redirect_uri"  -> Seq(callbackURL)
        )
      }
    }).map { response =>
      response.await.fold(
        failed => Left(GoogleOAuthException("Failed renewing access token: " + failed.getMessage)),
        response => {
          (response.json \ "access_token").asOpt[String].map { at =>
            result.redeem((at, (response.json \ "refresh_token").asOpt[String]))
          }.getOrElse {
            result.redeem(throw GoogleOAuthException("Failed getting access token : error while parsing access token"))
          }
        }
      )
    }.getOrElse {
      result.redeem(throw GoogleOAuthException("Failed renewing access token: preconditions failed"))
    }
    result
  }

  def renewAccessToken(refreshToken: String)(implicit request: Request[AnyContent]): Promise[String] = {
    Logger.info("Renewing access token...")
    var result = Promise[String]()
    (for {
      id <- APP_ID
      secret <- APP_SECRET
    } yield {
      WS.url(URL_ACCESS_TOKEN).post {
        Map(
          "grant_type"    -> Seq("refresh_token"),
          "refresh_token" -> Seq(refreshToken),
          "client_id"     -> Seq(id),
          "client_secret" -> Seq(secret)
        )
      }
    }).map { response =>
      response.await.fold(
        failed => Left(GoogleOAuthException("Failed renewing access token: " + failed.getMessage)),
        response => {
          (response.json \ "access_token").asOpt[String].map { at =>
            result.redeem(at)
          }.getOrElse {
            result.redeem(throw GoogleOAuthException("Failed getting access token : error while parsing access token"))
          }
        }
      )
    }.getOrElse {
      result.redeem(throw GoogleOAuthException("Failed renewing access token: preconditions failed"))
    }
    result
  }
}
