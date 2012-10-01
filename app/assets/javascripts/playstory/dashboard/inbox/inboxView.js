/**
 * inboxView.js
 */

(function(PlayStory, Inbox, Router) {

    Inbox.InboxView = function(server) {
        console.log("[Inbox.View] Init Inbox view");

        var self = this,
            modelsDef = PlayStory.ModelsDef;

        this.dom = new Inbox.InboxDOM();

        server.onReceive(server.urls.listen)
            .map(modelsDef.asFeed)
            .await(self.dom.updateLevels)
            .subscribe();

        server.onReceive(server.urls.inbox)
            .await(self.dom.initLevels)
            .subscribe();

        Router.when('dashboard/past/:project').chain(
            server.fetchInbox,
            self.dom.refreshNavigation,
            self.dom.updateStarred
        );

        Router.when('dashboard/present/:project').chain(
            server.fetchInbox,
            self.dom.refreshNavigation
        );

        Router.when('dashboard/past/:project/level/:level').chain(
            server.fetchInbox,
            self.dom.refreshNavigation
        );

        Router.when('dashboard/past/:project/search/*keywords').chain(
            server.fetchInbox,
            self.dom.refreshNavigation
        );

        Router.when('dashboard/past/:project/feed/:id/:limit').chain(
            server.fetchInbox,
            self.dom.refreshNavigation
        );

        this.lazyInit = Action(function(any, next) {
            next(any);
        });
    };

})(window.PlayStory,
   window.PlayStory.Init.Dashboard.Inbox,
   window.PlayStory.Router);
