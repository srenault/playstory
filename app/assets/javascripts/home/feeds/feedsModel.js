/**
 * feedsModel.js
 */

(function(Feeds) {

    Feeds.FeedsModel = function() {
        var self = this;
        this.collection = [];

        this.asFeed = function(data) {
            var feed = {
                id: data.log._id,
                project: data.project.realName,
                avatar: data.project.avatar,
                time: new Date(data.log.date),
                level: data.log.method,
                message: data.log.message
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