/**
 * home.js
 */

(function(PlayStory, Init, Router) {

    Init.Home.init = function() {
        var server       = new Init.Home.Server();
        var layout       = new Init.Home.Layout();
        var menuView     = new Init.Home.Menu.MenuView();
        var discoverView = new Init.Home.Discover.DiscoverView(server);
        var overviewView = new Init.Home.Overview.OverviewView(server);

        /**  layout  **/
        Router.fromStart().when('home*paths', layout.renderAsAction);
        Router.from('dashboard*paths').when('home*paths').lazy(function() {
            return PlayStory.Dashboard.destroy.and(layout.renderAsAction);
        });

        /** menu & overview **/
        Router.when('home').chain(
            menuView.dom.renderAsAction,
            overviewView.dom.renderAsAction,
            overviewView.lazyInit
        );

        /** dicover **/
        Router.when('home/discover', Action(function(any, next) {
            menuView.dom.render();
            discoverView.dom.render();
            discoverView.lazyInit();
            next(any);
        }));

        var destroyHome = layout.destroyAsAction.then(
            menuView.dom.destroyAsAction
           .and(discoverView.dom.destroyAsAction)
           .and(overviewView.dom.destroyAsAction)
        );

        return {
            destroy      : destroyHome,
            Server       : server,
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
