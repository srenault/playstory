/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = new (function() {
            var router = PlayStory.Router;
            if(router.currentRoute() == '') {
                router.go('past/all');
            }

            with(PlayStory.Init.Home) {
                this.Tabs = new Tabs.TabsView();
                this.FeedsPresent = new Feeds.FeedsPresentView(this.Tabs);
                this.FeedsPast = new Feeds.FeedsPastView(
                    this.FeedsPresent.server,
                    this.Tabs
                );
                this.Inbox = new Inbox.InboxView();
            }
        })();
    })(window.PlayStory);
});
