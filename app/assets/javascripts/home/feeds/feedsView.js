/**
 * feedsView.js
 */

(function(Home, Router, Models) {

    Home.Feeds.FeedsView = function(bucket) {
        console.log("[Feeds.View] Init feeds past view");
        var self = this,
            limit = 1000;

        //Init
        this.model      =  new Models.FeedsModel();
        this.pastDOM    =  new Home.Feeds.FeedsPastDOM(bucket);
        this.presentDOM =  new Home.Feeds.FeedsPresentDOM();
        this.server     =  new Home.Feeds.FeedsServer(bucket);

        //Views
        this.tabsView = new Home.Tabs.TabsView();
        this.inboxView = new Home.Inbox.InboxView(this.server, this.model, this.pastDOM);
        this.appsView = new Home.Apps.AppsView();

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
            this.presentDOM.clearFeeds,
            this.server.closeStream('/story/:project/listen').then(
            this.server.streamFeeds)
        );

        Router.when('past/:project/level/:level').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.closeStream('/story/:project/listen'),
            this.server.streamFeeds,
            this.server.fetchFeedsByLevel
        );

        Router.when('bookmarks').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            this.server.closeStream('/story/:project/listen'),
            this.server.streamFeeds,
            this.server.fetch('/story/all/bookmarks')
        );

        When(this.pastDOM.onNewCommentClick)
        .await(this.pastDOM.displayNewComment)
        .subscribe();

         When(this.pastDOM.onBookmarkClick)
        .map(this.pastDOM.newBookmark)
        .await(this.server.bookmark.then(this.inboxView.dom.updateStarred))
        .subscribe();
 
        When(this.pastDOM.onSubmitCommentClick)
        .map(this.pastDOM.newComment)
        .await(this.server.saveNewComment.then(this.pastDOM.displayComment))
        .subscribe();

        var goFeed = Router.goAsAction('past/:project/feed/:id', function(uriPattern, feed) {
            return uriPattern.replace(':project', feed.project)
                             .replace(':id', feed.id);
        });

        When(this.pastDOM.onFeedClick)
        .map(this.pastDOM.clickedFeed)
        .map(function($feed) {
            return {
                id: $feed.attr('id'),
                project: $feed.data('project')
            };
        }).await(goFeed.and(this.pastDOM.highlightFeed)).subscribe();
    };

})(window.PlayStory.Init.Home,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);
