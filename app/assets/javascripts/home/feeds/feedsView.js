/**
 * feedsView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsView = function(tabs, inbox) {
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
                .await(
                    self.pastDOM.fifo.then(
                    self.pastDOM.updateCounter.and(inbox.dom.updateCounters))
                )
                .subscribe();
            next(params);
         });

        var listenLastLogs = Action(function(params, next) {
            When(self.server.onSuccessLastLogs(params))
                .map(self.model.asFeed)
                .map(self.model.fifo)
                .await(self.pastDOM.fifo)
                .subscribe();
            next(params);
         });

        var listenLogsByLevel = Action(function(params, next) {
            When(self.server.onSuccessLogsByLevel(params))
                .map(self.model.asFeed)
                .map(self.model.fifo)
                .await(self.pastDOM.fifo)
                .subscribe();
            next(params);
         });

        var listenInbox = Action(function(params, next) {
            When(self.server.onSuccessInbox(params))
                .await(inbox.dom.initCounters)
                .subscribe();
            next(params);
         });

        //Fetch last logs
        Router.when('past/:project').chain(
            this.model.reset,
            listenLastLogs,
            this.model.reset,
            this.server.fetchFeeds,
            this.pastDOM.viewFeeds
        );

        //Fetch inbox counters
        Router.when('past/:project').chain(
            listenInbox,
            this.server.fetchInbox
        );

        //Stream new logs
        Router.when('past/:project').chain(
            this.model.reset,
            listenChunks,
            this.server.closeCurrentStream,
            this.server.bindToStream,
            this.pastDOM.hideFeeds,
            tabs.dom.refreshNavigation,
            inbox.dom.refreshNavigation
        );

        Router.when('past/:project/level/:level').chain(
            this.model.reset,
            this.pastDOM.clearFeeds,
            listenLogsByLevel,
            this.server.fetchFeedsByLevel,
            this.pastDOM.viewFeeds
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
