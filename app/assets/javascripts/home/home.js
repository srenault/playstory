/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = new (function(lastFeeds) {
            this.Tabs = new PlayStory.Init.Home.Tabs.TabsView();
            this.FeedsPresent = new PlayStory.Init.Home.Feeds.FeedsPresentView(this.Tabs);
            this.FeedsPast = new PlayStory.Init.Home.Feeds.FeedsPastView(
                this.FeedsPresent.server,
                this.Tabs
            );
        })();

    })(window.PlayStory);
});
