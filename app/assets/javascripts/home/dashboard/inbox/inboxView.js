/**
 * inboxView.js
 */

(function(PlayStory, Inbox, Router) {

    Inbox.InboxView = function(pastDOM) {
        console.log("[Inbox.View] Init Inbox view");

        var self = this,
            modelsDef = PlayStory.ModelsDef,
            server = PlayStory.Server;

        //Init
        this.dom = new Inbox.InboxDOM();

        server.onReceive(PlayRoutes.controllers.Dashboard.listen(':project').url)
            .map(modelsDef.asFeed)
            .await(this.dom.updateLevels)
            .subscribe();

        server.onReceive(PlayRoutes.controllers.Dashboard.inbox(':project').url)
            .await(this.dom.initLevels)
            .subscribe();

        Router.when('dashboard/past/:project').chain(
            server.fetchInbox,
            this.dom.refreshNavigation
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
    };

})(window.PlayStory,
   window.PlayStory.Init.Home.Dashboard.Inbox,
   window.PlayStory.Router);
