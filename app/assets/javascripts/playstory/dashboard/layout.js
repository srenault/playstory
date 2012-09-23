/**
 * layout.js
 */

(function(Dashboard) {

    Dashboard.Layout = function() {
        console.log("[Home.Layout] Init layout");
        var self = this;

        var elts = {
            $content: function() { return $('.content'); }
        };

        var tmpl = _.template($("#dashboard_layout_tmpl").html());

        this.render = function() {
            console.log("[Dashboard] Rendering Layout");
            elts.$content().append(tmpl({
            }));
            elts.$content().addClass("dashboard");
        };

        this.renderAsAction = asAction(self.render);

        this.destroy = function() {
            elts.$content().empty();
            elts.$content().removeClass("dashboard");
        };

        this.destroyAsAction = asAction(self.destroy);
    };

})(window.PlayStory.Init.Dashboard);