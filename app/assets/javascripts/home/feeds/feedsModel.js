/**
 * feedsModel.js
 */

(function(Feeds) {

    Feeds.FeedsModel = function() {
        var self = this;
        this.collection = [];

        this.asFeed = function(data) {
            var feed = {
                id: null,
                project: null,
                avatar: null,
                time: null,
                level: null,
                message: null
            };
            self.collection.push(feed);
            return feed;
        };

        this.findOne = function(id) {
            var foundFeed = this.collection.filter(function(feed) {
                return feed.id === id;
            });
            return (foundFeed.length == 1) ? foundFeed[0] : null;
        };
    };
})(window.PlayStory.Init.Home.Feeds);