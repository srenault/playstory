package models

import scala.util.matching.Regex
import com.mongodb.casbah.Imports._
import db.MongoDB

trait Searchable {
  def asWords(sentence: String): List[String] = sentence.split(" ").toList
  def asKeywords(fields: List[String]): MongoDBObject = {
    MongoDBObject("keywords" -> fields)
  }
  def byKeywords(fields: List[Regex]): MongoDBObject = ("keywords" $all fields)
}

object Searchable {
  def asRegex(keywords: List[String]): List[Regex] = keywords.map(k => """(i?)%s""".format(k).r)
}
