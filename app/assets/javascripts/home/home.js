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

            with(PlayStory.Init.Home) {
                this.Bucket = new Bucket();
                this.FeedsView = new Feeds.FeedsView(this.Bucket);
            }
        })();
    })(window.PlayStory);
});
