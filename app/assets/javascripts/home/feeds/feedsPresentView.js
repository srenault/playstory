/**
 * feedsPresentView.js
 */

(function(Feeds, Router) {

    Feeds.FeedsPresentView = function(Tabs) {
        console.log("[Feeds.View] Init feeds present view");
        var self = this;

        //Init
        this.dom = new Feeds.FeedsPresentDOM(),
        this.server = new Feeds.FeedsServer();
        this.model = new Feeds.FeedsModel();

        //Routes
        Router.put('present', this.dom.viewFeeds);

        console.log("sdfsdf");
        //Interactions
        When(Tabs.dom.onPresentTabClick)
       .await(this.dom.viewFeeds)
       .subscribe();

        When(Tabs.dom.onPastTabClick)
       .await(this.dom.hideFeeds)
       .subscribe();

        When(this.server.onReceiveFeed) //How to pass some parameters like project name ?
       .map(this.model.asFeed)
       .await(this.dom.createFeed)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds, window.PlayStory.Router);