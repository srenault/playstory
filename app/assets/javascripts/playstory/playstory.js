/**
 * playstory.js
 */

$(document).ready(function() {
    (function(PlayStory, Server) {
        console.log("[PlayStory] Init PlayStory app");
        PlayStory.Home      = PlayStory.Init.Home.init();
        PlayStory.Dashboard = PlayStory.Init.Dashboard.init();
    })(window.PlayStory,
       window.PlayStory.Server);
});

