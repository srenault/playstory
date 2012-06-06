/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsPresentServer = function() {
        console.log("[FeedsPresent.Server] Init feeds server");

        var subscriptions = [],
            sources = [];

        var _subscribe = function(uri, callback) {
            subscriptions[uri] = subscriptions[uri] || [];
            subscriptions[uri].push(callback);
        };

        var _streamFeeds = function(feed) {
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

        //Pulling with Event Source or Comet
        this.fromPulling = function(feed) {
            if(EventSource) {
                feed = JSON.parse(feed.data);
            }
            _streamFeeds(feed);
        };

        //Events
        var refFromPulling = this.fromPulling;

        this.onReceiveFeed = function(project) {
            return function(next) {
                console.log("[FeedsPresent.Server] Subscribe to feeds");
                var uri = '/story/:project/listen'.replace(':project', project);
                console.log("[FeedsPresent.Server] Listening " + uri);
                var source = new EventSource(uri);
                source.onmessage = refFromPulling;
                sources[uri] = source;
                _subscribe(uri, next);
            };
        };
    };

})(window.PlayStory.Init.Home.Feeds);