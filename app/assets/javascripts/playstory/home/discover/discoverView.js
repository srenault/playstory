/**
 * discoverView.js
 */

(function(Discover, Router) {

    Discover.DiscoverView = function(server) {
        console.log("[Discover.View] Init Discover view");
        var self = this;

        this.dom = new Discover.DiscoverDOM();

        Router.from('*paths').when('home/discover', server.fetchAllProjects);
        server.onReceive(server.urls.allProjects)
              .await(self.dom.displayProjects)
              .subscribe();

        this.lazyInit = function() {

            When(self.dom.onCreateProjectClick)
            .map(function(evt) {
                var $button = $(evt.currentTarget),
                    name = $button.siblings("input[name=name]").val(),
                    realName = $button.siblings("input[name=real_name]").val();

                return {
                    name: name,
                    realName: realName
                };
            })
            .await(server.createProject.then(self.dom.addProject))
            .subscribe();

            When(self.dom.onFollowClick)
            .map(function (evt) {
                var $link   = $(evt.currentTarget),
                    action  = $link.data('follow-action'),
                    project = $link.data('follow-project');

                return {
                    action: action,
                    project: project,
                    element: $link
                };
            })
            .await(server.followOrUnfollow.then(self.dom.updateFollowingStatus))
            .subscribe();
        };
    };

})(window.PlayStory.Init.Home.Discover,
   window.PlayStory.Router);
