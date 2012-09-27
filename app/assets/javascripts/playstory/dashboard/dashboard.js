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

        var bind = Action(function(evt, next) {
            tabsView.lazyInit();
            inboxView.lazyInit();
            appsView.lazyInit();
            searchView.lazyInit();
            feedsView.lazyInit();
            next(evt);
        });

        var renderDashboard = layout.renderAsAction.then(
            searchView.dom.renderAsAction
           .and(tabsView.dom.renderAsAction)
           .and(inboxView.dom.renderAsAction)
           .and(feedsView.pastDOM.renderAsAction)
           .and(feedsView.presentDOM.renderAsAction)
           .and(appsView.dom.renderAsAction)
        ).and(bind);

        var destroyDashboard = layout.destroyAsAction.then(
            tabsView.dom.destroyAsAction
           .and(inboxView.dom.destroyAsAction)
           .and(feedsView.pastDOM.destroyAsAction)
           .and(feedsView.presentDOM.destroyAsAction)
           .and(appsView.dom.destroyAsAction)
        );

        Router.from('home*path').when('dashboard*paths', PlayStory.Home.destroy.and(renderDashboard));
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