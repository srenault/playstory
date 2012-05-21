/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = (function() {
            this.Tabs = new PlayStory.Init.Home.Tabs.TabsView();
            this.FeedsPast = new PlayStory.Init.Home.Feeds.FeedsPastView(this.Tabs);
            this.FeedsPresent = new PlayStory.Init.Home.Feeds.FeedsPresentView(this.Tabs);
        })();

    })(window.PlayStory);
});
