/**
 * playstory.js
 */

$(document).ready(function() {
    (function(PlayStory, Server, Router) {
        console.log("[PlayStory] Init PlayStory app");

        if(!Router.currentRoute()) Router.go('home');

        Router.when('home*paths', Action(function(any, next) {
            if(!PlayStory.Home) PlayStory.Home = PlayStory.Init.Home.init();
            next(any);
        }));

        Router.when('dashboard*paths', Action(function(any, next) {
            if(!PlayStory.Dashboard) PlayStory.Dashboard = PlayStory.Init.Dashboard.init();
            next(any);
        }));

    })(window.PlayStory,
       window.PlayStory.Server,
       window.PlayStory.Router);
});

