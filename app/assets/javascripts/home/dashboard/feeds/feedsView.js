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
        this.pastDOM    =  new Home.Feeds.FeedsPastDOM();
        this.presentDOM =  new Home.Feeds.FeedsPresentDOM();

        this.tabsView = new Home.Tabs.TabsView();
        this.inboxView = new Home.Inbox.InboxView();
        this.searchView = new Home.Search.SearchView(this.pastDOM);
        this.appsView = new Home.Apps.AppsView();

        var displayDashboard = this.tabsView.dom.renderAsAction
                              .and(this.inboxView.dom.renderAsAction)
                              .and(this.pastDOM.renderAsAction)
                              .and(this.presentDOM.renderAsAction)
                              .and(this.appsView.dom.renderAsAction),

            destroyDashboard = this.tabsView.dom.destroyAsAction
                              .and(this.inboxView.dom.destroyAsAction)
                              .and(this.pastDOM.destroyAsAction)
                              .and(this.presentDOM.destroyAsAction)
                              .and(this.appsView.dom.destroyAsAction);

        server.onReceiveFromTemplate('user')
            .await(bucket.models('user').putAsAction)
            .subscribe();

        server.onReceive('/story/:project/listen')
            .map(modelsDef.asFeed)
            .await(
                bucket.collections('feeds').putAsAction
               .and(
                   this.presentDOM.displayNewFeed()
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
            var params = Router.matchCurrentRoute('past/:project/feed/:id/:limit');
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

        server.onReceive('/story/:project/search?*keywords')
           .map(modelsDef.asFeed)
           .await(this.pastDOM.displayNewFeed())
           .subscribe();

        Router.when('dashboard/past/:project/search/*keywords').chain(
            this.pastDOM.clearFeeds,
            this.searchView.dom.fillSearch,
            server.searchFeeds,
            server.streamFeeds
        );
 
        Router.when('dashboard/past/:project').chain(
            displayDashboard,
            this.searchView.dom.clearSearch,
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds
        )
       .and(server.fetchLastFeeds);

        Router.when('dashboard/present/:project').chain(
            this.searchView.dom.clearSearch,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds
        );

        Router.when('dashboard/past/:project/level/:level').chain(
            this.searchView.dom.clearSearch,
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds,
            server.fetchFeedsByLevel
        );

        Router.when('dashboard/bookmarks').chain(
            this.searchView.dom.clearSearch,
            bucket.collections('feeds').resetAsAction,
            this.pastDOM.clearFeeds,
            server.closeStream('/story/:project/listen'),
            server.streamFeeds,
            server.fetch('/story/all/bookmarks')
        );

        Router.when('dashboard/past/:project/feed/:id/:limit').chain(
            this.searchView.dom.clearSearch,
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

        var onlySpecifiedRoutes = function(routes) {
            return function() {
                var matchedRoutes = routes.filter(function(route) {
                    return Router.isMatchCurrentRoute(route);
                });
                if(matchedRoutes.length > 0) {
                    return {
                        route: matchedRoutes[0],
                        params: Router.matchCurrentRoute(matchedRoutes[0])
                    };
                } else return null;
            };
        };

        var isRouteValid = function(params) {
            return params != null && bucket.collections('feeds').size() > 0;
        };

        When(this.pastDOM.onBottomPageReach)
        .map(onlySpecifiedRoutes(['dashboard/past/:project',
                                  'dashboard/past/:project/level/:level']))
        .filter(isRouteValid)
        .await(server.fetchMoreFeeds)
        .subscribe();

        var goFeed = function(trigger) {
            return Router.goAsAction('dashboard/past/:project/feed/:id/' + limit, function(uriPattern, feed) {
                return uriPattern.replace(':project', feed.project)
                                 .replace(':id', feed.id);
            }, trigger);
        };

        When(this.pastDOM.onFeedClick)
        .map(this.pastDOM.clickedFeed)
        .map(function($feed) {
            return {
                id: $feed.attr('id'),
                project: $feed.data('project')
            };
        }).await(goFeed().and(this.pastDOM.highlightFeed)).subscribe();

        When(this.presentDOM.onFeedClick)
        .map(this.presentDOM.clickedFeed)
        .map(function($feed) {
            return {
                id: $feed.attr('id'),
                project: $feed.data('project')
            };
        }).await(goFeed(true).and(this.pastDOM.highlightFeed)).subscribe();
    };

})(window.PlayStory,
   window.PlayStory.Init.Home,
   window.PlayStory.Router);
