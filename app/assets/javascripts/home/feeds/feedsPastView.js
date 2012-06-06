/**
 * feedsPastView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsPastView = function(presentServer, tabs) {
        console.log("[FeedsPast.View] Init feeds past view");
        var self = this;

        //Init
        this.model = new Models.FeedsModel();
        this.dom = new Feeds.FeedsPastDOM(),
        this.pastServer = new Feeds.FeedsPastServer(this.model);
        this.presentServer = presentServer;

        //Routes
        Router.put('past', this.dom.viewFeeds);
        Router.put('past/all', this.dom.popupError);
        Router.put('past/error', this.dom.popupError);
        Router.put('past/warn', this.dom.popupError);
        Router.put('past/info', this.dom.popupError);
        Router.put('present', this.dom.hideFeeds);

        //Interactions
        When(this.dom.onNewCommentClick)
        .await(this.dom.displayNewComment)
        .subscribe();

        When(this.dom.onSubmitCommentClick)
        .await(this.pastServer.saveNewComment)
        .subscribe();

        When(tabs.dom.onPastTabClick)
       .await(this.dom.viewFeeds)
       .subscribe();

        When(tabs.dom.onPresentTabClick)
       .await(this.dom.hideFeeds)
       .subscribe();

        When(this.presentServer.onReceiveFeed("onconnect")) //from pulling.
       .await(this.dom.updateCounter)
       .subscribe();

        When(this.pastServer.onReceiveFeed) //from template.
       .map(this.model.asFeed)
       .map(this.model.fifo)
       .await(this.dom.fifo)
       .subscribe();

        When(this.dom.onMoreFeedsClick)
       .await(this.pastServer.fetchNewFeeds)
       .match(
           Http.m.OK(this.dom.addNewFeeds)
                 .dft(this.dom.showError)
        )
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
