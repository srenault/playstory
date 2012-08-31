/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = {
            Dashboard: PlayStory.Init.Home.Dashboard.init()
        };

    })(window.PlayStory);
});
