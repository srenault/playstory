/**
 * discoverView.js
 */

(function(Discover, Router) {

    Discover.DiscoverView = function(server) {
        console.log("[Discover.View] Init Discover view");
        var self = this;

        //Init
        this.dom = new Discover.DiscoverDOM();

        this.lazyInit = function() {
            Router.from('*paths').when('home/discover', this.dom.renderAsAction);
        };
    };

})(window.PlayStory.Init.Home.Discover,
   window.PlayStory.Router);