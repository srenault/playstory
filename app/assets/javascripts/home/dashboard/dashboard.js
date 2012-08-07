/**
 * dashboard.js
 */

(function(PlayStory, Home, Dashboard, Router) {

    Home.Dashboard = function() {

        this.layoutDOM = new Dashboard.LayoutDOM();
        this.tabsView = new Dashboard.Tabs.TabsView();
        this.inboxView = new Dashboard.Inbox.InboxView();
        this.searchView = new Dashboard.Search.SearchView(this.pastDOM);
        this.appsView = new Dashboard.Apps.AppsView();
        this.feedsView = new Dashboard.Feeds.FeedsView(this.searchView, this.inboxView);

        var renderDashboard = this.layoutDOM.renderAsAction.then(
            this.tabsView.dom.renderAsAction
           .and(this.inboxView.dom.renderAsAction)
           .and(this.feedsView.pastDOM.renderAsAction)
           .and(this.feedsView.presentDOM.renderAsAction)
           .and(this.appsView.dom.renderAsAction)
        );

        var destroyDashboard = this.layoutDOM.renderAsAction.then(
            this.tabsView.dom.destroyAsAction
           .and(this.inboxView.dom.destroyAsAction)
           .and(this.feedsView.pastDOM.destroyAsAction)
           .and(this.feedsView.presentDOM.destroyAsAction)
           .and(this.appsView.dom.destroyAsAction)
        );

        Router.when('dashboard/*any', renderDashboard);
    };

})(window.PlayStory,
   window.PlayStory.Init.Home,
   window.PlayStory.Init.Home.Dashboard,
   window.PlayStory.Router
);
