/**
 * feedsModel.js
 */

(function(Models) {

    Models.FeedsModel = function() {
        var self = this;

        this.asFeed = function(data) {
            var feed = {
                id: data.log._id,
                realName: data.project.realName,
                project: {
                    name: data.project.name
                },
                avatar: data.project.avatar,
                time: new Date(data.log.date),
                level: data.log.method,
                message: data.log.message,
                comments: data.log.comments
            };
            return feed;
        };
    };
})(window.PlayStory.Init.Models);