logLevel := Level.Warn

resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

resolvers += "repo.novus snaps" at "http://repo.novus.com/snapshots/"

addSbtPlugin("play" % "sbt-plugin" % "2.1-SNAPSHOT")
