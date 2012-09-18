import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

  val appName         = "playstory"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    "org.scalaz" %% "scalaz-core" % "6.0.4",
    "com.mongodb.casbah" % "casbah_2.9.1" % "2.1.5-1",
    "reactivemongo" %% "reactivemongo" % "0.1-SNAPSHOT",
    "play.modules.reactivemongo" %% "play2-reactivemongo" % "0.1-SNAPSHOT"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    resolvers += "sgodbillon" at "https://bitbucket.org/sgodbillon/repository/raw/master/snapshots/",
    resolvers += "scala tools" at "https://oss.sonatype.org/content/repositories/releases/"
  )
}
