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
                    var source = sources[wishedSource];
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
        this.saveNewComment = Action(function(evt, next) {
            console.log("[FeedsPast.Server] Saving a new comment");
            next(evt);
        });

        this.saveNewComment = Action(function(evt, next) {
           //Http.POST('/story/onconnect/4fc5ba8c1a880b75286e6e93', { message: "Hy dude"});
           $.ajax({
               url: '/story/onconnect/4fc5ba8c1a880b75286e6e93',
               type: 'POST',
               data: JSON.stringify({ message: "hey dude!"}),
               dataType: 'json',
               contentType: 'application/json',
               success: next
           });
        });
    };

})(window.PlayStory.Init.Home.Feeds);