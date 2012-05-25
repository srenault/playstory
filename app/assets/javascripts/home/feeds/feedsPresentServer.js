/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsPresentServer = function() {
        console.log("[FeedsPresent.Server] Init feeds server");

        var subscriptions = [],
            sources = [];

        var _subscribe = function(eventName, callback) {
            subscriptions[eventName] = subscriptions[eventName] || [];
            subscriptions[eventName].push(callback);
        };

        var _streamFeeds = function(feed) {
            var subscribers = subscriptions['onReceiveFeed'] || [];
            subscribers.forEach(function(s) {
                s(feed);
            });
        };

        var _closeStream = function(wishedSource) {
            for(sourceName in sources) {
                if(sourceName == wishedSource) {
                    var source = sources[sourceName];
                    source.close();
                    return true;
                }
            }
            return false;
        };

        //Event Source or Comet
        this.fromPulling = function(feed) {
            if(EventSource) feed = feed.data;
            _streamFeeds(JSON.parse(feed));
        };

        //Events
        var refFromPulling = this.fromPulling;

        this.onReceiveFeed = function(next) {
            console.log("[FeedsPresent.Server] Subscribe to feeds");
            var source = new EventSource('/story/onconnect/listen');
            source.onmessage = refFromPulling;
            sources['onReceiveFeed'] = source;
            _subscribe('onReceiveFeed', next);
        };

        this.closeFeedsStream = Action(function(evt, next) {
            next(_closeStream('onReceiveFeed'));
        });
    };

})(window.PlayStory.Init.Home.Feeds);