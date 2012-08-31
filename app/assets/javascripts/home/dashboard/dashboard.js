/**
 * dashboard.js
 */

(function(PlayStory, Init, Home, Router) {

    Init.Home.Dashboard.init = function() {
        this.Server     = new Init.Home.Dashboard.Server();
        this.layoutDOM  = new Init.Home.Dashboard.LayoutDOM();
        this.tabsView   = new Init.Home.Dashboard.Tabs.TabsView();
        this.inboxView  = new Init.Home.Dashboard.Inbox.InboxView(this.Server);
        this.searchView = new Init.Home.Dashboard.Search.SearchView();
        this.appsView   = new Init.Home.Dashboard.Apps.AppsView();
        this.feedsView  = new Init.Home.Dashboard.Feeds.FeedsView(
            this.Server,
            this.searchView,
            this.inboxView
        );

        var renderDashboard = this.layoutDOM.renderAsAction.then(
            this.searchView.dom.renderAsAction
           .and(this.tabsView.dom.renderAsAction)
           .and(this.inboxView.dom.renderAsAction)
           .and(this.feedsView.pastDOM.renderAsAction)
           .and(this.feedsView.presentDOM.renderAsAction)
           .and(this.appsView.dom.renderAsAction)
        );

        //render dashboard
        renderDashboard._do();

        //bind events
        this.tabsView.lazyInit();
        this.inboxView.lazyInit();
        this.appsView.lazyInit();
        this.searchView.lazyInit();
        this.feedsView.lazyInit();

        var destroyDashboard = this.layoutDOM.renderAsAction.then(
            this.tabsView.dom.destroyAsAction
           .and(this.inboxView.dom.destroyAsAction)
           .and(this.feedsView.pastDOM.destroyAsAction)
           .and(this.feedsView.presentDOM.destroyAsAction)
           .and(this.appsView.dom.destroyAsAction)
        );

        //Router.when('dashboard/*any', renderDashboard);
        return this;
    };

})(window.PlayStory,
   window.PlayStory.Init,
   window.PlayStory.Home,
   window.PlayStory.Router
);
