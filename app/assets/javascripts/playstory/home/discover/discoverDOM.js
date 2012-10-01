/**
 * discoverDOM.js
 */

(function(Discover, DOM, bucket) {

    Discover.DiscoverDOM = function() {
        console.log("[Discover.DOM] Init Discover DOM");
        var self = this;

        var elts = {
            $middleColumn:   DOM.$elt('.column-middle'),
            $discover:       DOM.$elt('.discover'),
            $createProject:  DOM.$elt('form[name=create_project] button'),
            $projects:       DOM.$elt('.projects'),
            $followLink:     DOM.$elt('.follow-link')
        };

        var tmpl        = _.template($("#discover_tmpl").html()),
            tmplProject = _.template($("#discover_project_tmpl").html()),
            tmplAddProject = _.template($("#discover_add_project_tmpl").html());

        this.render = function() {
            elts.$middleColumn().html(tmpl({}));
        };

        this.renderAsAction = asAction(self.render);

        this.destroy = function() {
            elts.$discover().remove();
        };

        this.destroyAsAction = asAction(self.destroy);

        this.onCreateProjectClick = function(next){
            elts.$createProject().click(preventDefault(next));
        },

        this.onFollowClick = function(next){
            elts.$discover().on('click', '.follow-link', preventDefault(next));
        },

        this.displayProjects = Action(function(projects, next) {
            var currentUser = bucket.models('user').get();
            elts.$discover().append(tmplProject({
                projects: projects.projects.map(function (project) {
                    project.isFollowed = _.contains(currentUser.projects, project.name);
                    return project;
                })
            }));
            next(projects);
        });

        this.updateFollowingStatus = Action(function(actionAndProject, next) {
            var user = bucket.models('user').get();
            if (actionAndProject.action == 'follow') {
                actionAndProject.element.text('Unfollow');
                actionAndProject.element.data('follow-action', 'unfollow');
                user.projects.push(actionAndProject.project);
            } else {
                actionAndProject.element.text('Follow');
                actionAndProject.element.data('follow-action', 'follow');
                user.projects = user.projects.filter(function(project) {
                    return !(project == actionAndProject.project);
                });
            }
            next(actionAndProject);
        });

        this.addProject = Action(function(project, next) {
            elts.$projects().prepend(tmplAddProject({
                project: project
            }));
        });

        return this;
    };

})(window.PlayStory.Init.Home.Discover,
   window.DOM,
   PlayStory.Bucket);
