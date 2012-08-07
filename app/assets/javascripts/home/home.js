/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = new (function() {
            var router = PlayStory.Router;
            if(router.currentRoute() == '') {
                router.go('dashboard/past/all');
            }

            this.dashboard = new PlayStory.Init.Home.Dashboard();
        })();
    })(window.PlayStory);
});
