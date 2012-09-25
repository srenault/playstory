package models

import scala.concurrent.Future
import scala.util.matching.Regex
import play.modules.reactivemongo._
import reactivemongo.api._
import reactivemongo.api.indexes.{ NSIndex, Index }
import reactivemongo.core.commands.LastError
import play.api.Logger
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.json.Json._
import db._

trait Searchable {
  self: MongoDB =>

  def indexes: List[List[String]] = Nil

  def writeIndexes() = {
    Logger.debug("[Searchable] Ensure that we have thoses indexes : " + indexes + " on collection " + collectName)
    val dftCollection = DefaultCollection(collectName, ReactiveMongoPlugin.db)
    def writeIndex(fields: List[String]) {
      val key = fields.map(field => (field -> true))
      val name = collectName + "_" + fields.mkString("-")
      val unique = false
      val background = true
      val dropDups = false
      val index = Index(key, Some(name), unique, background, dropDups)
      dftCollection.indexesManager.ensure(index)
    }
    indexes.foreach(writeIndex)
  }
  writeIndexes()

  def asKeywords(fields: List[String]): JsObject = Json.obj("keywords" -> fields.map(JsString(_)))
  def byKeywords(fields: List[Regex]): JsObject = {
    Json.obj("keywords" ->
      Json.obj("$elemMatch" -> fields.map { k =>
        Json.obj("$regex" -> k.toString)
                                         }.foldLeft(Json.obj())((k1, k2) => k1 ++ k2))
    )
  }
}

object Searchable {
  def asRegex(keywords: List[String]): List[Regex] = keywords.map(k => """(i?)%s""".format(k).r)

  def asWords(sentence: String): List[String] = sentence.split(" ").toList

  def writeAsKeywords(path: JsPath): OWrites[JsValue] = {
    (__ \ 'keywords).json.put(
      path.json.pick.transform { json =>
        val keywords = asWords((json \ "message").as[String]).map(JsString(_))
        JsArray(keywords)
      }
    )
  }
}
