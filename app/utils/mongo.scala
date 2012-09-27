package utils.mongo

import org.jboss.netty.buffer.ChannelBuffer
import reactivemongo.api.{ SortOrder, FlattenedCursor, Collection, QueryOpts }
import reactivemongo.core.commands.LastError
import reactivemongo.bson._
import reactivemongo.bson.handlers._
import reactivemongo.bson.handlers.DefaultBSONHandlers._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.Result
import play.modules.reactivemongo.PlayBsonImplicits._

object MongoUtils {
  def handleLastError(lastError: LastError, success: => Result, failed: String => Result) = {
    lastError match {
      case LastError(true, _, _, _, _) => success
      case LastError(false, Some(err), code, errorMsg, _) => {
        val message = """Error : %s \n
                         Error code: %d \n
                         Error message: %s""".format(err, code, errorMsg)
        failed(message)
      }
    }
  }
}

case class QueryBuilder(
  queryDoc: Option[JsObject] = None,
  sortDoc: Option[JsObject] = None,
  hintDoc: Option[JsObject] = None,
  projectionDoc: Option[JsObject] = None,
  explainFlag: Boolean = false,
  snapshotFlag: Boolean = false,
  commentString: Option[String] = None
) {
  def makeQueryDocument: JsObject = {
    if(!sortDoc.isDefined && !hintDoc.isDefined && !explainFlag && !snapshotFlag && !commentString.isDefined)
      queryDoc.getOrElse(Json.obj())
    else {
      val queryDocJson: Option[JsObject] = Some(Json.obj("$query" -> queryDoc.getOrElse[JsObject](Json.obj())))
      val sortDocJson: Option[JsObject] = sortDoc.map(sd => Json.obj("$orderby" -> sd))
      val hintDocJson: Option[JsObject] = hintDoc.map(hd => Json.obj("$hint" -> hd))
      val explainFlagJson: Option[JsObject] = if(explainFlag) Some(Json.obj("$explain" -> true)) else None
      val snapshotFlagJson: Option[JsObject] = if(snapshotFlag) Some(Json.obj("$snapshotFlag" -> true)) else None
      val commentStringJson: Option[JsObject] = commentString.map(cmt => Json.obj("$comment" -> cmt))

      List(queryDocJson,
           sortDocJson,
           hintDocJson,
           explainFlagJson,
           snapshotFlagJson,
           commentStringJson).flatten
      .foldLeft(Json.obj())((q1, q2) => q1 ++ q2)
    }
  }

  def makeMergedBuffer :ChannelBuffer = {
    projectionDoc.map { p =>
      JsObjectWriter.write(makeQueryDocument ++ p)
    } getOrElse JsObjectWriter.write(makeQueryDocument)
  }

  def query[Qry](selector: Qry)(implicit writer: BSONWriter[Qry]) :QueryBuilder = copy(queryDoc=Some(
    JsObjectReader.read(writer.write(selector))
  ))

  def query(selector: JsObject) :QueryBuilder = copy(queryDoc=Some(selector))

  def sort(document: JsObject) :QueryBuilder = copy(sortDoc=Some(document))

  def sort( sorters: (String, SortOrder)* ) :QueryBuilder = copy(sortDoc = {
    if(sorters.size == 0)
      None
    else {
      val json = sorters.foldLeft(Json.obj()) { (s1, s2) =>
        s2 match {
          case (field, SortOrder.Ascending) => s1 ++ Json.obj(field -> Json.obj("$int" -> 1))
          case (field, SortOrder.Descending) => { s1 ++ Json.obj(field -> Json.obj("$int" -> -1)) }
        }
      }
      Some(json)
    }
  })

  def projection[Pjn](p: Pjn)(implicit writer: BSONWriter[Pjn]) :QueryBuilder = copy(projectionDoc=Some(
    JsObjectReader.read(writer.write(p))
  ))

   def hint(document: JsObject) :QueryBuilder = copy(hintDoc=Some(document))

   def hint(indexName: String) :QueryBuilder = copy(hintDoc=Some(Json.obj(indexName -> 1)))

  def snapshot(flag: Boolean = true) :QueryBuilder = copy(snapshotFlag=flag)

  def comment(message: String) :QueryBuilder = copy(commentString=Some(message))
}

object JsonQueryBuilderImplicits {
  implicit object ChannelBufferWriter extends RawBSONWriter[ChannelBuffer] {
    def write(buffer: ChannelBuffer): ChannelBuffer = buffer
  }
}

object JsonQueryHelpers {
  import JsonQueryBuilderImplicits._

  def find(collection: Collection, query: QueryBuilder, opts: QueryOpts = QueryOpts()) :FlattenedCursor[JsValue] = {
    import scala.concurrent.ExecutionContext.Implicits.global
    val ec = implicitly[scala.concurrent.ExecutionContext]
    collection.find(query.makeMergedBuffer, opts)(ChannelBufferWriter, DefaultBSONReaderHandler, JsValueReader, ec)
  }
}
