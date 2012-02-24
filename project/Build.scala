import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "playstory"
    val appVersion      = "1.0"

  val appDependencies = Seq(
    "com.novus" %% "salat-core" % "0.0.8-SNAPSHOT"
      // Add your project dependencies here,
  )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
      // Add your own project settings here      
    )

}
