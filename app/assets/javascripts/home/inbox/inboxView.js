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

        server.onReceive('/story/:project/listen')
            .map(modelsDef.asFeed)
            .await(this.dom.updateLevels)
            .subscribe();

        server.onReceive('/story/:project/inbox')
            .await(this.dom.initLevels)
            .subscribe();

        Router.when('past/:project').chain(
            server.fetchInbox,
            this.dom.refreshNavigation
        );

        Router.when('present/:project', this.dom.refreshNavigation);

        Router.when('past/:project/level/:level').chain(
            server.fetchInbox,
            this.dom.refreshNavigation
        );

        Router.when('past/:project/search/*keywords').chain(
            server.fetchInbox,
            this.dom.refreshNavigation
        );
    };

})(window.PlayStory,
   window.PlayStory.Init.Home.Inbox,
   window.PlayStory.Router);
