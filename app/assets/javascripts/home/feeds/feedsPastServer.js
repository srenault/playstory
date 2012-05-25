/**
 * feedsPastServer.js
 */

(function(Feeds) {

    Feeds.FeedsPastServer = function() {
        console.log("[FeedsPast.Server] Init feeds server");

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

        var _streamNewFeeds = function(feed) {
            var subscribers = subscriptions['onReceiveNewFeed'] || [];
            subscribers.forEach(function(s) {
                s(JSON.parse(feed.data));
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

        this.fromTemplate = function(feed) {
            _streamFeeds(feed);
        };

        this.onReceiveFeed = function(next) {
            console.log("[FeedsPast.Server] Subscribe to feeds");
            _subscribe('onReceiveFeed', next);
        };

        this.onReceiveNewFeed = function(next) {
            console.log("[FeedsPast.Server] Subscribe to new feeds");
            var source = new EventSource('/story/onconnect/new');
            source.onmessage = _streamNewFeeds;
            sources['onReceiveNewFeed'] = source;
            _subscribe('onReceiveNewFeed', next);
        };

        //Actions
        this.fetchNewFeeds = Http.GET('/story/onconnect/news');

        this.closeNewFeedsStream = Action(function(evt, next) {
            next(_closeStream('onReceiveNewFeed'));
        });
    };

})(window.PlayStory.Init.Home.Feeds);