/**
 * searchView.js
 */

(function(PlayStory, Search, Router) {

    Search.SearchView = function(pastDOM) {
        console.log("[Search.View] Init Search view");

        var self = this,
            modelsDef = PlayStory.ModelsDef,
            server = PlayStory.Server;

        //Init
        this.dom = new Search.SearchDOM();

        var action = Action(function(evt, next) {
            console.log('typed!');
            next(evt);
         });


        When(this.dom.onTypingEnter)
        .map(this.dom.typedQuery)
        .await(server.searchFeeds).subscribe();
    };

})(window.PlayStory,
   window.PlayStory.Init.Home.Search,
   window.PlayStory.Router);
