/**
 * home.js
 */

(function(PlayStory, Init, Router) {

    Init.Home.init = function() {

        var layout    = new Init.Home.Layout();
        var menuView  = new Init.Home.Menu.MenuView();
        var discoverView  = new Init.Home.Discover.DiscoverView();
        var overviewView  = new Init.Home.Overview.OverviewView();

        var renderHome = layout.renderAsAction.then(
            menuView.dom.renderAsAction
           .and(discoverView.dom.renderAsAction)
           .and(overviewView.dom.renderAsAction)
        );

        var destroyHome = layout.destroyAsAction.then(
            menuView.dom.destroyAsAction
           .and(discoverView.dom.destroyAsAction)
           .and(overviewView.dom.destroyAsAction)
        );

        renderHome._do();

        return {
            Layout       : layout,
            MenuView     : menuView,
            DiscoverView : discoverView,
            OverviewView : overviewView
        };
    };

})(window.PlayStory,
   window.PlayStory.Init,
   window.PlayStory.Router
);
