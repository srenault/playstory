/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = new (function() {
            var router = PlayStory.Router;
            if(router.currentRoute() == '') {
                router.go('past/all');
            }

            this.FeedsView = new PlayStory.Init.Home.Feeds.FeedsView();
        })();
    })(window.PlayStory);
});
