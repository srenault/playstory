/**
 * inboxView.js
 */

(function(PlayStory, Inbox, Router) {

    Inbox.InboxView = function(server) {
        console.log("[Inbox.View] Init Inbox view");

        var self = this,
            modelsDef = PlayStory.ModelsDef;

        this.dom = new Inbox.InboxDOM();

        this.lazyInit = function() {
            server.onReceive(server.urls.listen)
                .map(modelsDef.asFeed)
                .await(this.dom.updateLevels)
                .subscribe();

            server.onReceive(server.urls.inbox)
                .await(this.dom.initLevels)
                .subscribe();

            Router.when('dashboard/past/:project').chain(
                server.fetchInbox,
                this.dom.refreshNavigation,
                this.dom.updateStarred
            );

            Router.when('dashboard/present/:project', this.dom.refreshNavigation);

            Router.when('dashboard/past/:project/level/:level').chain(
                server.fetchInbox,
                this.dom.refreshNavigation
            );

            Router.when('dashboard/past/:project/search/*keywords').chain(
                server.fetchInbox,
                this.dom.refreshNavigation
            );

            Router.when('dashboard/past/:project/feed/:id/:limit').chain(
                server.fetchInbox,
                this.dom.refreshNavigation
            );
        };
    };

})(window.PlayStory,
   window.PlayStory.Init.Home.Dashboard.Inbox,
   window.PlayStory.Router);
