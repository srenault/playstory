/**
 * feedsPastView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsPastView = function(Tabs) {
        console.log("[FeedsPast.View] Init feeds past view");
        var self = this;

        //Init
        this.model = new Models.FeedsModel();
        this.dom = new Feeds.FeedsPastDOM(),
        this.server = new Feeds.FeedsPastServer();

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

        When(this.server.onReceiveFeed) //from template here.
       .map(this.model.asFeed)
       .map(this.model.fifo)
       .await(this.dom.fifo)
       .subscribe();

        When(this.dom.onMoreFeedsClick)
       .await(this.server.fetchNewFeeds)
       .match(Http.m.OK(this.dom.newFeeds)
                    .dft(this.dom.showError))
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
