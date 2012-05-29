/**
 * feedsPastServer.js
 */

(function(Feeds) {

    Feeds.FeedsPastServer = function(model) {
        console.log("[FeedsPast.Server] Init feeds server");
        var that = this;
        this.model = model;

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
        this.fetchNewFeeds = new (function() {
            var lastFeed = _.head(that.model.collection());
            var lastUpdate = lastFeed ? lastFeed.time.getTime() : new Date().getTime();
            return Http.GET('/story/onconnect/last/' + lastUpdate);
        })();
    };

})(window.PlayStory.Init.Home.Feeds);