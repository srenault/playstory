/**
 * overviewDOM.js
 */

(function(Overview, DOM) {

    Overview.OverviewDOM = function() {
        console.log("[Overview.DOM] Init Overview DOM");
        var self = this;

        var elts = {
            $middleColumn : DOM.$elt('.column-middle'),
            $overview : DOM.$elt('.overview'),
            $dashboard : DOM.$elt('a[href=#dashboard]'),
            $chart : DOM.$elt('#chart')
        };

        var tmpl = _.template($("#overview_tmpl").html());

        this.drawSummary = Action(function(data, next) {
            var inputs = [];
            var projects = [];
            data.summary.forEach(function(proj, projIndex) {
                projects.push(proj.project);
                proj.counters.forEach(function(counter, index) {
                    inputs[index] = inputs[index] ||  [];
                    inputs[index].push({ x: projIndex, y: counter.count});
                });
            });

            var onClickLegend = function(project) {
            };

            Charts.drawStackedBars(inputs, projects, elts.$chart()[0], { start: "#91adc7", end: "#637a8f" }, onClickLegend);
       });

        this.render = function() {
            elts.$middleColumn().html(tmpl({ }));
        };

        this.renderAsAction = Action(function(any, next) {
            self.render();
            next(any);
        });

        this.destroy = function() {
            elts.$overview().remove();
        };

        this.destroyAsAction = Action(function(any, next) {
            self.destroy();
            next(any);
        });

        return this;
    };

})(window.PlayStory.Init.Home.Overview, window.DOM);

// var raw = [
//     [ { x: 0, y: 1 },   { x: 1, y: 2 },  { x: 2, y: 3 },  { x: 3, y: 4 }],
//     [ { x: 0, y: 1.5 }, { x: 1, y: 2.5 },{ x: 2, y: 3.5 },{ x: 3, y: 4.5 }],
//     [ { x: 0, y: 2 },   { x: 1, y: 3 },  { x: 2, y: 4 },  { x: 3, y: 5 }],
//     [ { x: 0, y: 2.5 }, { x: 1, y: 3.5 },{ x: 2, y: 4.5 },{ x: 3, y: 5.5 }]
// ];
