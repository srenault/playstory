/**
 * feedsPresentView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsPresentView = function(Tabs) {
        console.log("[FeedsPresent.View] Init feeds present view");
        var self = this;

        //Init
        this.dom = new Feeds.FeedsPresentDOM(),
        this.server = new Feeds.FeedsPresentServer();
        this.model = new Models.FeedsModel();

        //Routes
        Router.put('present', this.dom.viewFeeds);
        Router.put('past', this.dom.hideFeeds);

        //Interactions
        When(Tabs.dom.onPresentTabClick)
       .await(this.dom.viewFeeds)
       .subscribe();

        When(Tabs.dom.onPastTabClick)
       .await(this.dom.hideFeeds)
       .subscribe();

        When(this.server.onReceiveFeed('onconnect'))
       .map(this.model.asFeed)
       .map(this.model.fifo)
       .await(this.dom.fifo)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);