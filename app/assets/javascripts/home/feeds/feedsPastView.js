/**
 * feedsPastView.js
 */

(function(Feeds, Router, Tabs) {

    Feeds.FeedsPastView = function(Tabs) {
        console.log("[FeedsPast.View] Init feeds past view");
        var self = this;

        //Init
        this.dom = new Feeds.FeedsPastDOM(),
        this.server = new Feeds.FeedsServer();
        this.model = new Feeds.FeedsModel();

        //Routes
        Router.put('past', this.dom.viewFeeds);
        Router.put('present', this.dom.hideFeeds);

        //Interactions
        When(Tabs.dom.onPastTabClick)
       .await(this.dom.viewFeeds)
       .subscribe();

        When(Tabs.dom.onPresentTabClick)
       .await(this.dom.hideFeeds)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds, window.PlayStory.Router);
