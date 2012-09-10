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
            searchView.dom.renderAsAction
           .and(tabsView.dom.renderAsAction)
           .and(inboxView.dom.renderAsAction)
           .and(feedsView.pastDOM.renderAsAction)
           .and(feedsView.presentDOM.renderAsAction)
           .and(appsView.dom.renderAsAction)
        );

        //bind events
        tabsView.lazyInit();
        inboxView.lazyInit();
        appsView.lazyInit();
        searchView.lazyInit();
        feedsView.lazyInit();

        var destroyDashboard = layout.destroyAsAction.then(
            tabsView.dom.destroyAsAction
           .and(inboxView.dom.destroyAsAction)
           .and(feedsView.pastDOM.destroyAsAction)
           .and(feedsView.presentDOM.destroyAsAction)
           .and(appsView.dom.destroyAsAction)
        );

        //PlayStory.Home.destroy.and(renderDashboard)
        Router.from('home').when('dashboard', Action(function(any, next) {
            alert('OOOOOOOOoooooo');
            return next(any);
        }));

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