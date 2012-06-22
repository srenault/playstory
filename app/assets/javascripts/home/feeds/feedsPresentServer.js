/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsPresentServer = function() {
        console.log("[FeedsPresent.Server] Init feeds server");

        var self = this,
            subscriptions = [],
            sources = [];

        var _subscribe = function(uri, callback) {
            subscriptions[uri] = subscriptions[uri] || [];
            subscriptions[uri].push(callback);
        };

        var _alreadyConnected = function(uri) {
            for(var subscription in subscriptions) {
                if(subscription === uri) return true;
            }
            return false;
        };

        var _streamFeeds = function(feed) {
            if(EventSource) feed = JSON.parse(feed.data);
            var subscribers = subscriptions[feed.src] || [];
            subscribers.forEach(function(s) {
                s(feed);
            });
        };

        var _closeStream = function(wishedSource) {
            for(sourceName in sources) {
                if(sourceName == wishedSource) {
                    var source = sources[wishedSource];
                    source.close();
                    return true;
                }
            }
            return false;
        };

        var _buildURI = function(project) {
            return '/story/:project/listen'.replace(':project', project);
        };

        /*
         * Receiving feeds Event Source or Comet.
         */
        this.fromPulling = function(feed) {
            console.log(feed);
            _streamFeeds(feed);
        };

        //Events
        this.onReceiveFeed = function(project) {
            return function(next) {
                _subscribe(_buildURI(project), next);
            };
        };

        //Actions
        /**
         * Pull new logs.
         */
        this.bindToStream = Action(function(project, next) {
            var uri = _buildURI(project[0]);
            if(project.length > 0 && !_alreadyConnected(uri)) {
                console.log("[FeedsPresent.Server] Listening " + uri);
                var source = new EventSource(uri);
                source.onmessage = _streamFeeds;
                sources[uri] = source;
                _subscribe(uri, self.onReceiveFeed);
            }
            next(project);
         });
    };

})(window.PlayStory.Init.Home.Feeds);