package utils

import org.jboss.netty.buffer.ChannelBuffer
import reactivemongo.bson._
import reactivemongo.bson.handlers._
import reactivemongo.api.SortOrder
import play.api.libs.json._
import play.api.libs.json.Json._
import play.modules.reactivemongo.PlayBsonImplicits._

case class QueryBuilder(
  queryDoc: Option[JsObject] = None,
  sortDoc: Option[JsObject] = None,
  hintDoc: Option[JsObject] = None,
  projectionDoc: Option[JsObject] = None,
  explainFlag: Boolean = false,
  snapshotFlag: Boolean = false,
  commentString: Option[String] = None
) {
  /** Builds the query document by merging all the params. */
  def makeQueryDocument: JsObject = {
    if(!sortDoc.isDefined && !hintDoc.isDefined && !explainFlag && !snapshotFlag && !commentString.isDefined)
      queryDoc.getOrElse(Json.obj())
    else {
      val explainFlagJson = if(explainFlag) {
        Some(Json.obj("$explain" -> true))
      } else None

      val snapshotFlagJson = if(snapshotFlag) {
        Some(Json.obj("$snapshotFlag" -> true))
      } else None

      val commentStringJson = commentString.map(cmt => Json.obj("$comment" -> cmt))

      List(queryDoc,
           sortDoc,
           hintDoc,
           explainFlagJson,
           snapshotFlagJson,
           commentStringJson).flatten
                             .foldLeft(Json.obj())((q1, q2) => q1 ++ q2)
    }
  }

  def makeMergedBuffer :ChannelBuffer = {
    projectionDoc.map { p =>
      JsObjectWriter.write(makeQueryDocument ++ p)
    }.getOrElse {
      JsObjectWriter.write(makeQueryDocument)
    }
  }

  /**
   * Sets the query (the selector document).
   *
   * @tparam Qry The type of the query. An implicit [[reactivemongo.bson.handlers.BSONWriter]][Qry] typeclass for handling it has to be in the scope.
   */
  def query[Qry](selector: Qry)(implicit writer: BSONWriter[Qry]) :QueryBuilder = copy(queryDoc=Some(
    JsObjectReader.read(writer.write(selector))
  ))

  /** Sets the query (the selector document). */
  def query(selector: JsObject) :QueryBuilder = copy(queryDoc=Some(selector))

  /** Sets the sorting document. */
  def sort(document: JsObject) :QueryBuilder = copy(sortDoc=Some(document))

  /** Sets the sorting document. */
  def sort( sorters: (String, SortOrder)* ) :QueryBuilder = copy(sortDoc = {
    if(sorters.size == 0)
      None
    else {
      val json = sorters.foldLeft(Json.obj()) { (s1, s2) =>
        s2 match {
          case (field, SortOrder.Ascending) => s1 ++ Json.obj(field -> 1)
          case (field, SortOrder.Descending) => s1 ++ Json.obj(field -> -1)
        }
      }
      Some(json)
    }
  })

  /**
   * Sets the projection document (for [[http://www.mongodb.org/display/DOCS/Retrieving+a+Subset+of+Fields retrieving only a subset of fields]]).
   *
   * @tparam Pjn The type of the projection. An implicit [[reactivemongo.bson.handlers.BSONWriter]][Pjn] typeclass for handling it has to be in the scope.
   */
  def projection[Pjn](p: Pjn)(implicit writer: BSONWriter[Pjn]) :QueryBuilder = copy(projectionDoc=Some(
    JsObjectReader.read(writer.write(p))
  ))

  /** Sets the hint document (a document that declares the index MongoDB should use for this query). */
  def hint(document: JsObject) :QueryBuilder = copy(hintDoc=Some(document))

  /** Sets the hint document (a document that declares the index MongoDB should use for this query). */
  def hint(indexName: String) :QueryBuilder = copy(hintDoc=Some(Json.obj(indexName -> 1)))

  //TODO def explain(flag: Boolean = true) :QueryBuilder = copy(explainFlag=flag)

  /** Toggles [[http://www.mongodb.org/display/DOCS/How+to+do+Snapshotted+Queries+in+the+Mongo+Database snapshot mode]]. */
  def snapshot(flag: Boolean = true) :QueryBuilder = copy(snapshotFlag=flag)

  /** Adds a comment to this query, that may appear in the MongoDB logs. */
  def comment(message: String) :QueryBuilder = copy(commentString=Some(message))
}
