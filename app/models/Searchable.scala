package models

import scala.util.matching.Regex
import play.api.libs.json._

trait Searchable {
  def asWords(sentence: String): List[String] = sentence.split(" ").toList
  def asKeywords(fields: List[String]): JsObject = Json.obj("keywords" -> fields.map(JsString(_)))
  def byKeywords(fields: List[Regex]): JsObject = {
    Json.obj("keywords" -> Json.obj("$all" -> fields.map { k => 
      Json.obj("$regex" -> k.toString)
    }))
  }
}

object Searchable {
  def asRegex(keywords: List[String]): List[Regex] = keywords.map(k => """(i?)%s""".format(k).r)
}
