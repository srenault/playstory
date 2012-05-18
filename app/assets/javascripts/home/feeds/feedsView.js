/**
 * feeds.js
 */

(function(Feeds, Router) {

    Feeds.FeedsView = function() {
        console.log("[Feeds.View] Init feeds view");

        //Init
        this.dom = new Feeds.FeedsDOM(),
        this.server = new Feeds.FeedsServer();
        this.model = new Feeds.FeedsModel();

        //Routes
        Router.put('feed/1', this.dom.viewFeed);

        //Interactions
        When(this.server.onReceiveFeed) //How to pass some parameters like project name ?
       .map(this.model.asFeed)
       .await(this.dom.createFeed)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds || {}, window.PlayStory.Router);