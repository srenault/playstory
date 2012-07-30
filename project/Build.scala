import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

  val appName         = "playstory"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    "org.scalaz" %% "scalaz-core" % "6.0.4",
    "com.mongodb.casbah" %% "casbah" % "2.1.5-1"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    resolvers += ("mandubian-mvn snapshots" at "https://github.com/mandubian/mandubian-mvn/raw/master/snapshots")
  )
}
