/**
 * home.js
 */

(function(PlayStory, Init, Router) {

    Init.Home.init = function() {
        var server       = new Init.Home.Server();
        var layout       = new Init.Home.Layout();
        var menuView     = new Init.Home.Menu.MenuView();
        var discoverView = new Init.Home.Discover.DiscoverView();
        var overviewView = new Init.Home.Overview.OverviewView(server);

        server.onReceiveFromTemplate('user')
            .await(PlayStory.Bucket.models('user').setAsAction)
            .subscribe();

        server.onReceiveFromTemplate('projects')
            .await(PlayStory.Bucket.collections('projects').setAsAction)
            .subscribe();

        var renderHome = layout.renderAsAction.then(
            menuView.dom.renderAsAction
           .and(overviewView.dom.renderAsAction)
        );

        var destroyHome = layout.destroyAsAction.then(
            menuView.dom.destroyAsAction
           .and(discoverView.dom.destroyAsAction)
           .and(overviewView.dom.destroyAsAction)
        );

        if(Router.currentRoute() == '') {
            Router.go('home');
        }

        Router.fromStart().when('home*paths', layout.renderAsAction);

        menuView.lazyInit();
        overviewView.lazyInit();
        discoverView.lazyInit();

        Router.from('dashboard*paths').when('home*paths').lazy(function() {
            return PlayStory.Dashboard.destroy.and(renderHome);
        });

        return {
            render       : renderHome,
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
