/**
 * home.js
 */

$(document).ready(function() {
    (function(PlayStory) {
        console.log("[Home] Init Home page");

        PlayStory.Home = {
            Feeds: new PlayStory.Init.Home.Feeds.FeedsView()
        };
    }(window.PlayStory || {}));
});
