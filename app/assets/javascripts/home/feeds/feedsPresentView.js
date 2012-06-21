/**
 * feedsPresentView.js
 */

(function(Feeds, Router, Models) {

    Feeds.FeedsPresentView = function(Tabs) {
        console.log("[FeedsPresent.View] Init feeds present view");
        var self = this;

        //Init
        this.dom = new Feeds.FeedsPresentDOM(),
        this.server = new Feeds.FeedsPresentServer();
        this.model = new Models.FeedsModel();

        var listen = Action(function(project, next) {
            if(project) {
                When(self.server.onReceiveFeed(project))
                    .map(self.model.asFeed)
                    .map(self.model.fifo)
                    .await(self.dom.fifo)
                    .subscribe();
            }
            next(project);
         });

        //Routes
        Router.when('present', this.dom.viewFeeds);
        Router.when('past', this.dom.hideFeeds);
        Router.when('past/:project', this.server.bindToStream.then(listen));

        //Interactions
        When(Tabs.dom.onPresentTabClick)
       .await(this.dom.viewFeeds)
       .subscribe();

        When(Tabs.dom.onPastTabClick)
       .await(this.dom.hideFeeds)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Feeds,
   window.PlayStory.Router,
   window.PlayStory.Init.Models);