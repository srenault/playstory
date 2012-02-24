logLevel := Level.Warn

resolvers ++= Seq(
    DefaultMavenRepository,
    Resolver.url("Play", url("http://download.playframework.org/ivy-releases/"))(Resolver.ivyStylePatterns),
  "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Scala-Tools Maven2 Snapshots Repository" at "http://scala-tools.org/repo-snapshots"
)

addSbtPlugin("play" % "sbt-plugin" % "2.0-RC3-SNAPSHOT")

addSbtPlugin("org.ensime" % "ensime-sbt-cmd" % "0.0.7")
