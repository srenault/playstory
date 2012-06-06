/**
 * inboxView.js
 */

(function(Inbox) {

    Inbox.InboxView = function() {
        console.log("[Inbox.View] Init Inbox view");
        var self = this;

        //Init
       this.dom = new Inbox.InboxDOM();
    };

})(window.PlayStory.Init.Home.Inbox);

