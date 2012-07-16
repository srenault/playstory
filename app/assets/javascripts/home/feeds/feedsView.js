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

        /**
         * Init data from template
         */
        this.server.onReceive('/template')
        .await(this.model.keepRef)
        .subscribe();

        /**
         * Stream new feeds
         */
        Router.when('past/:project').chain(
            this.model.reset,
            this.pastDOM.clearFeeds,
            this.server.closeCurrentStream,
            this.server.stream('/story/:project/listen', function(uriPattern, params) {
                return uriPattern.replace(':project', params[0]);
            }),
            this.pastDOM.hideFeeds,
            tabs.dom.refreshNavigation,
            inbox.dom.refreshNavigation
        );

        this.server.onReceive('/story/:project/listen')
                   .map(this.model.asFeed)
                   .map(this.model.fifo)
                   .await(
                       this.pastDOM.fifo.then(
                       this.pastDOM.updateCounter.and(inbox.dom.updateCounters))
                   ).subscribe();

        /**
         * Fetch last feeds
         */
        Router.when('past/:project').chain(
            this.server.fetch('/story/:project/last', function(uriPatten, params) {
                return uriPatten.replace(':project', params[0]);
            }).then(
                this.pastDOM.viewFeeds
            )
        );

        this.server.onReceive('/story/:project/last')
                   .map(self.model.asFeed)
                   .map(self.model.fifo)
                   .await(self.pastDOM.fifo)
                   .subscribe();

        /**
         * Fetch logs by level
         */
         Router.when('past/:project/level/:level').chain(
            this.model.reset,
            this.pastDOM.clearFeeds,
            this.server.fetch('/story/:project/level/:level', function(uriPattern, params) {
                return uriPattern.replace(':project', params[0])
                                 .replace(':level', params[1]);
            }).then(
                this.pastDOM.viewFeeds
            )
         );

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
       .await(this.presentDOM.hideFeeds.and(this.pastDOM.viewFeeds))
       .subscribe();

        When(tabs.dom.onPresentTabClick)
       .await(this.pastDOM.hideFeeds.and(this.presentDOM.viewFeeds))
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
