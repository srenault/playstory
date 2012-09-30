/**
 * dashboard.js
 */

(function(PlayStory, Init, Router) {

    Init.Dashboard.init = function() {
        var server     = new Init.Dashboard.Server();
        var layout     = new Init.Dashboard.Layout();
        var tabsView   = new Init.Dashboard.Tabs.TabsView();
        var inboxView  = new Init.Dashboard.Inbox.InboxView(server);
        var searchView = new Init.Dashboard.Search.SearchView();
        var appsView   = new Init.Dashboard.Apps.AppsView(server);
        var feedsView  = new Init.Dashboard.Feeds.FeedsView(
            server,
            searchView,
            inboxView
        );

        var renderDashboard = layout.renderAsAction.then(
            searchView.dom.renderAsAction.then(searchView.lazyInit)
           .and(tabsView.dom.renderAsAction.then(tabsView.lazyInit))
           .and(inboxView.dom.renderAsAction.then(inboxView.lazyInit))
           .and(feedsView.pastDOM.renderAsAction)
           .then(feedsView.presentDOM.renderAsAction.then(feedsView.lazyInit))
           .and(appsView.dom.renderAsAction.then(appsView.lazyInit))
        );

        var destroyDashboard = layout.destroyAsAction.then(
            tabsView.dom.destroyAsAction
           .and(inboxView.dom.destroyAsAction)
           .and(feedsView.pastDOM.destroyAsAction)
           .and(feedsView.presentDOM.destroyAsAction)
           .and(appsView.dom.destroyAsAction)
        );

        Router.from('home*path').when('dashboard*paths').lazy(function() {
            return PlayStory.Home.destroy.and(renderDashboard);
        });
        Router.fromStart().when('dashboard*paths', renderDashboard);

        return {
            render     : renderDashboard,
            destroy    : destroyDashboard,
            Server     : server,
            Layout     : layout,
            TabsView   : tabsView,
            InboxView  : inboxView,
            SearchView : searchView,
            AppsView   : appsView,
            FeedsView  : feedsView
        };
    };

})(window.PlayStory,
   window.PlayStory.Init,
   window.PlayStory.Router
);