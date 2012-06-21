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

        //Actions
        var listen = Action(function(project, next) {
            if(project) {
                When(self.presentServer.onReceiveFeed(project[0])) //from pulling.
                    .await(self.dom.updateCounter)
                    .subscribe();
            }
            next(project);
         });

        //Routes
        Router.when('past', this.dom.viewFeeds);
        Router.when('past/:project', this.dom.clearFeeds.then(this.model.reset)
                                    .then(this.pastServer.fetchFeeds
                                    .then(this.presentServer.bindToStream.then(listen))));

        Router.when('present', this.dom.hideFeeds);

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
