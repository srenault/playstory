/**
 * inboxView.js
 */

(function(Inbox, Router) {

    Inbox.InboxView = function(server) {
        console.log("[Inbox.View] Init Inbox view");
        var self = this;

        //Init
        this.dom = new Inbox.InboxDOM();

        //Router.when('past/:project', server.fetchInbox);
    };

})(window.PlayStory.Init.Home.Inbox, window.PlayStory.Router);