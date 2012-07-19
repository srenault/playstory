/**
 * inboxView.js
 */

(function(Inbox, Router) {

    Inbox.InboxView = function(server, model, pastDOM) {
        console.log("[Inbox.View] Init Inbox view");
        var self = this;

        //Init
        this.dom = new Inbox.InboxDOM();

        server.onReceive('/story/:project/listen')
            .map(model.asFeed)
            .await(this.dom.updateLevels)
            .subscribe();

        server.onReceive('/story/:project/inbox')
            .await(this.dom.initLevels)
            .subscribe();

        Router.when('past/:project').chain(
            this.dom.refreshNavigation,
            server.fetchInbox
        );

        Router.when('present/:project', this.dom.refreshNavigation);

        Router.when('past/:project/level/:level').chain(
            server.fetchInbox,
            this.dom.refreshNavigation
        );

        When(pastDOM.onBookmarkClick)
        .await(this.dom.updateStarred)
        .subscribe();
    };

})(window.PlayStory.Init.Home.Inbox, window.PlayStory.Router);