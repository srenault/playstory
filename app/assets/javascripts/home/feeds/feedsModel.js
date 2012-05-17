/**
 * feedsModel.js
 */

(function(Feeds) {

    Feeds.FeedsModel = function() {
        return {
            asFeed: function(data) {
                return {
                    project: null,
                    avatar: null,
                    time: null,
                    level: null,
                    message: null
                };
            }
        };
    };
})(window.PlayStory.Init.Home.Feeds || {});