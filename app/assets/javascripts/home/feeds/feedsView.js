/**
 * feedsView.js
 */

(function(PlayStory, Home, Router) {

    Home.Feeds.FeedsView = function() {
        console.log("[Feeds.View] Init feeds past view");
        var self = this,
            bucket = PlayStory.Bucket,
            modelsDef = PlayStory.ModelsDef,
            server = PlayStory.Server,
            limit = 10;

        //Init
        this.tabsView = new Home.Tabs.TabsView();
        this.inboxView = new Home.Inbox.InboxView(this.pastDOM);
        this.appsView = new Home.Apps.AppsView();
        this.pastDOM    =  new Home.Feeds.FeedsPastDOM();
        this.presentDOM =  new Home.Feeds.FeedsPresentDOM();

        server.onReceiveFromTemplate('user')
            .await(bucket.models('user').putAsAction)
            .subscribe();

        server.onReceive('/story/:project/listen')
            .map(modelsDef.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(
                   this.presentDOM.displayNewFeed(limit)
                  .then(this.pastDOM.updateCounter)
               )
        ).subscribe();

        server.onReceive('/story/:project/last')
            .map(modelsDef.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(this.pastDOM.displayNewFeed(limit))
        ).subscribe();

        server.onReceive('/story/:project/level/:level')
            .map(modelsDef.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(self.pastDOM.displayNewFeed(limit))
        ).subscribe();

        server.onReceive('/story/all/bookmarks')
            .map(modelsDef.asFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(self.pastDOM.displayNewFeed(limit))
        ).subscribe();

        server.onReceive('/story/:project/log/:id/more/:limit')
        .map(modelsDef.asFeed)
        .await(
            bucket.collections('feeds').putAsAction
           .and(self.pastDOM.displayNewFeed())
        ).subscribe();

        var isWishedFeed = function(feed) {
            var params = Router.currentRouteAsParams('past/:project/feed/:id/:limit');
            return feed.id == params[1];
        };

        server.onReceive('/story/:project/log/:id/:limit')
            .map(modelsDef.asFeed)
            .filter(isWishedFeed)
            .await(
                bucket.collections('feeds').asFifo(limit)
                .and(this.pastDOM.displayNewFeed(limit)
                     .then(this.pastDOM.highlightFeed))
        ).subscribe();

        server.onReceive('/story/:project/log/:id/:limit')
            .map(modelsDef.asFeed)
            .filter(function(feed) { return !isWishedFeed(feed); })
            .await(
                bucket.collections('feeds').asFifo(limit)
               .and(self.pastDOM.displayNewFeed(limit))
        ).subscribe();

        Router.when('past/:project').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds
        )
       .and(server.fetchLastFeeds);

        Router.when('present/:project').chain(
            server.closeStream('/story/:project/listen').then(
            server.streamFeeds)
        );

        Router.when('past/:project/level/:level').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds,
            server.fetchFeedsByLevel
        );

        Router.when('bookmarks').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds,
            server.fetch('/story/all/bookmarks')
        );

        Router.when('past/:project/feed/:id/:limit').chain(
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds
        ).and(server.fetchFeedWithContext);

        When(this.pastDOM.onNewCommentClick)
        .await(this.pastDOM.displayNewComment)
        .subscribe();

        When(this.pastDOM.onBookmarkClick)
        .map(this.pastDOM.newBookmark)
        .await(server.bookmark.then(this.inboxView.dom.updateStarred))
        .subscribe();
 
        When(this.pastDOM.onSubmitCommentClick)
        .map(this.pastDOM.newComment)
        .await(server.saveNewComment.then(this.pastDOM.displayComment))
        .subscribe();

        var goFeed = Router.goAsAction('past/:project/feed/:id/' + limit, function(uriPattern, feed) {
            return uriPattern.replace(':project', feed.project)
                             .replace(':id', feed.id);
        });

        When(this.pastDOM.onBottomPageReach)
        .map(function() {
            var routes = ['past/:project', 'past/:project/level/:level'];
            var matchedRoutes = routes.filter(function(route) {
                return Router.isMatchCurrentRoute(route);
            });
            if(matchedRoutes.length > 0) {
                return {
                    route: matchedRoutes[0],
                    params: Router.matchCurrentRoute(matchedRoutes[0])
                };
            } else return null;
        })
        .filter(function(params) {
            return params != null && bucket.collections('feeds').size() > 0;
        })
        .await(server.fetchMoreFeeds)
        .subscribe();

        When(this.pastDOM.onFeedClick)
        .map(this.pastDOM.clickedFeed)
        .map(function($feed) {
            return {
                id: $feed.attr('id'),
                project: $feed.data('project')
            };
        }).await(goFeed.and(this.pastDOM.highlightFeed)).subscribe();
    };

})(window.PlayStory,
   window.PlayStory.Init.Home,
   window.PlayStory.Router);
