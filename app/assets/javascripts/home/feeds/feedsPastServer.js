/**
 * feedsPastServer.js
 */

(function(Feeds) {

    Feeds.FeedsPastServer = function(model) {
        console.log("[FeedsPast.Server] Init feeds server");

        this.model = model;

        var subscriptions = [],
            sources = [],
            self = this;

        var _subscribe = function(eventName, callback) {
            subscriptions[eventName] = subscriptions[eventName] || [];
            subscriptions[eventName].push(callback);
        };

        var _alreadyConnected = function(uri) {
            for(var subscription in subscriptions) {
                if(subscription === uri) return true;
            }
            return false;
        };

        var _streamFeeds = function(feed) {
            var subscribers = subscriptions['onReceiveFeed'] || [];
            subscribers.forEach(function(s) {
                s(JSON.parse(feed));
            });
        };

        this.fromTemplate = function(feed) {
            _streamFeeds(JSON.stringify(feed));
        };

        //Events
        this.onReceiveFeed = function(next) {
            console.log("[FeedsPast.Server] Subscribe to feeds");
            _subscribe('onReceiveFeed', next);
        };

        //Actions

        /**
         * Fetch logs by making a classic GET request.
         */
        this.fetchFeeds = Action(function(project, next) {
           $.ajax({
               url: '/story/:project/last'.replace(':project', project[0]),
               dataType: 'json',
               success: function(feeds) {
                   feeds.forEach(function(feed) {
                       _streamFeeds(feed);
                       next(project);
                   });
               }
           });
        });

        /**
         * Fetch last logs from specified time.
         */
        this.fetchNewFeeds = Action(function(evt, next) {
            console.log("[FeedsPast.Server] Fetching news feeds");
            next(evt);
        });

        /**
         * Comment one log.
         */
        this.saveNewComment = Action(function(evt, next) {
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