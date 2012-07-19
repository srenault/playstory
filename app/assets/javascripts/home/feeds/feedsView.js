/**
 * feedsView.js
 */

(function(Home, Router, Models) {

    Home.Feeds.FeedsView = function(bucket) {
        console.log("[Feeds.View] Init feeds past view");
        var self = this,
            limit = 10;

        //Init
        this.model      =  new Models.FeedsModel();
        this.pastDOM    =  new Home.Feeds.FeedsPastDOM(bucket);
        this.presentDOM =  new Home.Feeds.FeedsPresentDOM();
        this.server     =  new Home.Feeds.FeedsServer(bucket);

        //Views
        this.tabsView = new Home.Tabs.TabsView();
        this.inboxView = new Home.Inbox.InboxView(this.server, this.model, this.pastDOM);
        this.appsView = new Home.Apps.AppsView();


        var refreshNavigation = this.tabsView.dom.refreshNavigation.and(
            this.inboxView.dom.refreshNavigation).and(
                this.appsView.dom.refreshNavigation('past')
            );

        this.server.onReceiveFromTemplate('user')
            .await(bucket.models('user').putAsAction)
            .subscribe();

        this.server.onReceive('/story/:project/listen')
            .map(this.model.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(
                   this.presentDOM.displayNewFeed(limit)
                  .then(this.pastDOM.updateCounter)
               )
        ).subscribe();

        this.server.onReceive('/story/:project/last')
            .map(self.model.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(this.pastDOM.displayNewFeed(limit))
        ).subscribe();

        this.server.onReceive('/story/:project/level/:level')
            .map(self.model.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(self.pastDOM.displayNewFeed(limit))
        ).subscribe();

        this.server.onReceive('/story/all/bookmarks')
            .map(self.model.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(self.pastDOM.displayNewFeed(limit))
        ).subscribe();

        Router.when('past/:project').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.closeStream('/story/:project/listen'),
            this.server.streamFeeds
        )
       .and(this.server.fetchLastFeeds);

        Router.when('present/:project').chain(
            this.server.closeStream('/story/:project/listen'),
            this.server.streamFeeds
        );

        Router.when('past/:project/level/:level').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.fetchFeedsByLevel
        );

        Router.when('bookmarks').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.fetch('/story/all/bookmarks')
        );

        When(this.pastDOM.onNewCommentClick)
        .await(this.pastDOM.displayNewComment)
        .subscribe();

         When(this.pastDOM.onBookmarkClick)
        .map(this.pastDOM.newBookmark)
        .await(this.server.bookmark)
        .subscribe();
 

        When(this.pastDOM.onSubmitCommentClick)
        .map(this.pastDOM.newComment)
        .await(this.server.saveNewComment.then(this.pastDOM.displayComment))
        .subscribe();
    };

})(window.PlayStory.Init.Home,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
