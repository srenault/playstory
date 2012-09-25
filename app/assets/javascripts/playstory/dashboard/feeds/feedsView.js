/**
 * feedsView.js
 */

(function(PlayStory, Dashboard, Router) {

    Dashboard.Feeds.FeedsView = function(server, searchView, inboxView) {
        console.log("[Feeds.View] Init feeds past view");
        var self = this,
            bucket = PlayStory.Bucket,
            modelsDef = PlayStory.ModelsDef,
            limit = 10;

        this.pastDOM    =  new Dashboard.Feeds.FeedsPastDOM();
        this.presentDOM =  new Dashboard.Feeds.FeedsPresentDOM();

        this.lazyInit = function() {
            server.onReceive(server.urls.listen)
                .map(modelsDef.asFeed)
                .await(
                 bucket.collections('feeds').putAsAction
                .and(this.presentDOM.displayNewFeed())
                .then(this.pastDOM.updateCounter)
            ).subscribe();

            server.onReceive(server.urls.last)
                .map(modelsDef.asFeed)
                .await(
                    bucket.collections('feeds').asFifo(limit)
                   .and(this.pastDOM.displayNewFeed(limit))
            ).subscribe();

            server.onReceive(server.urls.byLevel)
                .map(modelsDef.asFeed)
                .await(
                    bucket.collections('feeds').asFifo(limit)
                   .and(self.pastDOM.displayNewFeed(limit))
            ).subscribe();

            server.onReceive(server.urls.bookmarks)
                .map(modelsDef.asFeed)
                .await(
                    bucket.collections('feeds').asFifo(limit)
                   .and(self.pastDOM.displayNewFeed(limit))
                ).subscribe();

            server.onReceive(server.urls.more)
                .map(modelsDef.asFeed)
                .await(
                    bucket.collections('feeds').putAsAction
                   .and(self.pastDOM.displayPastFeed)
            ).subscribe();

            server.onReceive(server.urls.withContext)
                .map(modelsDef.asFeed)
                .filter(function(feed) {
                    var params = Router.matchCurrentRoute('dashboard/past/:project/feed/:id/:limit');
                    return (feed.id == params[1]);
                })
                .await(
                    bucket.collections('feeds').asFifo(limit)
                       .and(this.pastDOM.displayNewFeed(limit)
                       .then(this.pastDOM.highlightFeed))
                ).subscribe();

            server.onReceive(server.urls.withContext)
                .map(modelsDef.asFeed)
                .filter(function(feed) {
                    var params = Router.matchCurrentRoute('dashboard/past/:project/feed/:id/:limit');
                    return !(feed.id == params[1]);
                })
                .await(
                    bucket.collections('feeds').asFifo(limit)
                   .and(self.pastDOM.displayNewFeed(limit))
            ).subscribe();

            server.onReceive('/dashboard/:project/search?*keywords')
                  .map(modelsDef.asFeed)
                  .await(this.pastDOM.displayNewFeed())
                  .subscribe();

            Router.when('dashboard/past/:project/search/*keywords').chain(
                this.pastDOM.clearFeeds,
                searchView.dom.fillSearch,
                server.searchFeeds,
                server.streamFeeds
            );

            Router.when('dashboard/past/:project').chain(
                searchView.dom.clearSearch,
                bucket.collections('feeds').resetAsAction,
                this.pastDOM.clearFeeds,
                server.closeStream(server.urls.listen),
                server.streamFeeds
            ).and(server.fetchLastFeeds);

            Router.when('dashboard/present/:project').chain(
                searchView.dom.clearSearch,
                server.closeStream(server.urls.listen),
                server.streamFeeds
            );

            Router.when('dashboard/past/:project/level/:level').chain(
                searchView.dom.clearSearch,
                bucket.collections('feeds').resetAsAction,
                this.pastDOM.clearFeeds,
                server.closeStream(server.urls.listen),
                server.streamFeeds,
                server.fetchFeedsByLevel
            );

            Router.when('dashboard/bookmarks').chain(
                searchView.dom.clearSearch,
                bucket.collections('feeds').resetAsAction,
                this.pastDOM.clearFeeds,
                server.fetch(server.urls.bookmarks)
            );

            Router.when('dashboard/past/:project/feed/:id/:limit').chain(
                searchView.dom.clearSearch,
                bucket.collections('feeds').resetAsAction,
                this.pastDOM.clearFeeds,
                server.closeStream(server.urls.listen),
                server.streamFeeds
            ).and(server.fetchFeedWithContext);

            When(this.pastDOM.onNewCommentClick)
                .await(this.pastDOM.displayNewComment)
                .subscribe();

            When(this.pastDOM.onBookmarkClick)
                .map(this.pastDOM.newBookmark)
                .await(server.bookmark.then(inboxView.dom.summupStarred))
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

            // When(this.pastDOM.onBottomPageReach)
            //     .map(onlySpecifiedRoutes(['dashboard/past/:project',
            //                               'dashboard/past/:project/level/:level',
            //                               'dashboard/past/:project/feed/:id/:level']))
            //     .filter(isRouteValid)
            //     .await(server.fetchMoreFeeds)
            //     .subscribe();

            var goFeed = function(trigger) {
                return Router.goAsAction('dashboard/past/:project/feed/:id/' + limit, function(uriPattern, params) {
                    return uriPattern.replace(':project', params.project)
                                     .replace(':id', params.id);
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

            When(this.pastDOM.onMoreFeedsClick)
                .map(onlySpecifiedRoutes(['dashboard/past/:project',
                                          'dashboard/past/:project/level/:level',
                                          'dashboard/past/:project/feed/:id/:level']))
                .filter(isRouteValid)
                .map(function(res) {
                    return res.params[0];
                })
                .await(server.fetchLastFeeds.then(self.pastDOM.resetMoreFeeds))
                .subscribe();
        };
    };

})(window.PlayStory,
   window.PlayStory.Init.Dashboard,
   window.PlayStory.Router);