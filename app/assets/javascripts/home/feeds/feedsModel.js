/**
 * feedsModel.js
 */

(function(Models) {

    Models.FeedsModel = function() {
        var self = this,
            collection = [];

        this.collection = function() {
            return collection;
        };

        this.asFeed = function(data) {
            var feed = {
                id: data.log._id,
                project: data.project.realName,
                avatar: data.project.avatar,
                time: new Date(data.log.date),
                level: data.log.method,
                message: data.log.message
            };
            return feed;
        };

        this.asFeeds = function(data) {
            data.map(function(feed) {
                return self.asFeed(feed);
            });
        };

        this.fifo = function(feed) {
            var isFull = false;
            collection.unshift(feed);

            if(collection.length > 10) {
                isFull = true;
                collection.pop();
            }

            return {
                newFeed: feed,
                isFull: isFull
            };
        };

        this.findOne = function(id) {
            var foundFeed = collection.filter(function(feed) {
                return feed.id === id;
            });
            return (foundFeed.length == 1) ? foundFeed[0] : null;
        };

        //Action
         this.reset = Action(function(evt, next) {
             collection = [];
             next(evt);
         });
    };
})(window.PlayStory.Init.Models);