/**
 * feedsView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsView = function(tabs, inbox, bucket) {
        console.log("[Feeds.View] Init feeds past view");
        var self = this;

        //Init
        this.model      =  new Models.FeedsModel();
        this.pastDOM    =  new Feeds.FeedsPastDOM(this.model);
        this.presentDOM =  new Feeds.FeedsPresentDOM();
        this.server     =  new Feeds.FeedsServer(this.model);

        /**
         * Init data from template
         */
        this.server.onReceive('/template')
        .await(bucket.collections('feeds').putAsAction)
        .subscribe();

        /**
         * Stream new feeds
         */
        Router.when('past/:project').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.closeStream('/story/:project/listen').then(this.server.streamFeeds),
            tabs.dom.refreshNavigation,
            inbox.dom.refreshNavigation
        ).and(this.server.fetchInbox);

        this.server.onReceive('/story/:project/listen')
            .map(this.model.asFeed)
            .map(bucket.collections('feeds').asFifo)
            .await(
                this.pastDOM.displayNewFeed.then(
                    this.pastDOM.updateCounter.and(
                    inbox.dom.updateCounters)
                )
            ).subscribe();

        this.server.onReceive('/story/:project/inbox')
            .await(
                inbox.dom.initCounters
            ).subscribe();

        /**
         * Fetch last feeds
         */
        Router.when('past/:project').chain(
            this.server.fetchLastFeeds.then(
                this.pastDOM.displayFeeds
            )
        );

        this.server.onReceive('/story/:project/last')
            .map(self.model.asFeed)
            .map(bucket.collections('feeds').asFifo)
            .await(self.pastDOM.displayNewFeed)
            .subscribe();

        /**
         * Fetch logs by level
         */
         Router.when('past/:project/level/:level').chain(
            this.model.reset,
            this.pastDOM.clearFeeds,
             this.server.fetchFeedsByLevel.then(
                this.pastDOM.displayFeeds
             )
         ).and(this.server.fetchInbox);

        this.server.onReceive('/story/:project/level/:level')
            .map(self.model.asFeed)
            .map(self.model.fifo)
            .await(self.pastDOM.fifo)
            .subscribe();

        /**
         * Comments
         */
        When(this.pastDOM.onNewCommentClick)
        .await(this.pastDOM.displayNewComment)
        .subscribe();

        When(this.pastDOM.onSubmitCommentClick)
        .map(this.pastDOM.newComment)
        .await(this.server.saveNewComment.then(this.pastDOM.displayComment))
        .subscribe();


        /**
         * Tabs
         */
        When(tabs.dom.onPastTabClick)
       .await(this.presentDOM.hideFeeds.and(this.pastDOM.displayFeeds))
       .subscribe();

        When(tabs.dom.onPresentTabClick)
       .await(this.pastDOM.hideFeeds.and(this.presentDOM.displayFeeds))
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
