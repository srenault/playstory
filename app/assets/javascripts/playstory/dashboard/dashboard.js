/**
 * dashboard.js
 */

(function(PlayStory, Init, Router) {

    Init.Dashboard.init = function() {
        var server     = new Init.Dashboard.Server();
        var layoutDOM  = new Init.Dashboard.LayoutDOM();
        var tabsView   = new Init.Dashboard.Tabs.TabsView();
        var inboxView  = new Init.Dashboard.Inbox.InboxView(server);
        var searchView = new Init.Dashboard.Search.SearchView();
        var appsView   = new Init.Dashboard.Apps.AppsView(server);
        var feedsView  = new Init.Dashboard.Feeds.FeedsView(
            server,
            searchView,
            inboxView
        );

        //TODO In another file to ensure the loading
        server.onReceiveFromTemplate('user')
            .await(PlayStory.Bucket.models('user').setAsAction)
            .subscribe();

        server.onReceiveFromTemplate('projects')
            .await(PlayStory.Bucket.collections('projects').setAsAction)
            .subscribe();

        var renderDashboard = layoutDOM.renderAsAction.then(
            searchView.dom.renderAsAction
                .and(tabsView.dom.renderAsAction)
                .and(inboxView.dom.renderAsAction)
                .and(feedsView.pastDOM.renderAsAction)
                .and(feedsView.presentDOM.renderAsAction)
                .and(appsView.dom.renderAsAction)
        );

        //render dashboard
        renderDashboard._do();

        if(Router.currentRoute() == '') Router.go('dashboard/past/all');

        //bind events
        tabsView.lazyInit();
        inboxView.lazyInit();
        appsView.lazyInit();
        searchView.lazyInit();
        feedsView.lazyInit();

        var destroyDashboard = layoutDOM.renderAsAction.then(
            tabsView.dom.destroyAsAction
                .and(inboxView.dom.destroyAsAction)
                .and(feedsView.pastDOM.destroyAsAction)
                .and(feedsView.presentDOM.destroyAsAction)
                .and(appsView.dom.destroyAsAction)
        );

        return {
            Server     : server,
            LayoutDOM  : layoutDOM,
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
