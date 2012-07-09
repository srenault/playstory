/**
 * feedsView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsView = function(tabs) {
        console.log("[Feeds.View] Init feeds past view");
        var self = this;

        //Init
        this.model      =  new Models.FeedsModel();
        this.pastDOM    =  new Feeds.FeedsPastDOM(this.model);
        this.presentDOM =  new Feeds.FeedsPresentDOM();
        this.server     =  new Feeds.FeedsServer(this.model);

        //Actions
        var listenChunks = Action(function(params, next) {
            When(self.server.onReceiveChunk(params))
                .map(self.model.asFeed)
                .map(self.model.fifo)
                .await(self.pastDOM.fifo.then(self.pastDOM.updateCounter))
                .subscribe();
            next(params);
         });

        var listenFetch = Action(function(params, next) {
            When(self.server.onSuccessFetch(params))
                .map(self.model.asFeed)
                .map(self.model.fifo)
                .await(self.pastDOM.fifo)
                .subscribe();
            next(params);
         });

        //Routes
        Router.when('past', this.pastDOM.viewFeeds);
        Router.when('past/:project').chain(
            this.model.reset,
            listenFetch,
            this.model.reset,
            this.server.fetchFeeds
        );

        Router.when('present', this.pastDOM.hideFeeds);
        Router.when('past/:project').chain(
            this.model.reset,
            listenChunks,
            this.server.closeCurrentStream,
            this.server.bindToStream
        );

        //Interactions
        When(this.server.onReceiveFromTmpl)
        .await(this.model.keepRef)
        .subscribe();

        When(this.pastDOM.onNewCommentClick)
        .await(this.pastDOM.displayNewComment)
        .subscribe();

        When(this.pastDOM.onSubmitCommentClick)
        .map(this.pastDOM.newComment)
        .await(this.server.saveNewComment.then(this.pastDOM.displayComment))
        .subscribe();

        When(tabs.dom.onPastTabClick)
       .await(this.presentDOM.hideFeeds.and(this.pastDOM.viewFeeds))
       .subscribe();

        When(tabs.dom.onPresentTabClick)
       .await(this.pastDOM.hideFeeds.and(this.presentDOM.viewFeeds))
       .subscribe();

        When(this.pastDOM.onMoreFeedsClick)
       .await(this.server.fetchNewFeeds)
       .match(
           Http.m.OK(this.pastDOM.addNewFeeds)
                 .dft(this.pastDOM.showError)
        )
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
