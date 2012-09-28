/**
 * discoverView.js
 */

(function(Discover, Router) {

    Discover.DiscoverView = function(server) {
        console.log("[Discover.View] Init Discover view");
        var self = this;

        //Init
        this.dom = new Discover.DiscoverDOM();

        this.lazyInit = function() {

            server.onReceive(server.urls.allProjects)
            .await(this.dom.displayProjects)
            .subscribe();

            Router.from('*paths').when(
                'home/discover',
                this.dom.renderAsAction.then(server.fetchAllProjects));

            When(this.dom.onCreateProjectClick)
            .map(function(evt) {
                var $button = $(evt.currentTarget);
                var name = $button.siblings("input[name=name]").val();
                var realName = $button.siblings("input[name=real_name]").val();
                return { name: name, realName: realName };
            })
            .await(server.createProject.then(this.dom.addProject))
            .subscribe();
        };
    };

})(window.PlayStory.Init.Home.Discover,
   window.PlayStory.Router);
