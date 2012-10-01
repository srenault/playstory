/**
 * overviewDOM.js
 */

(function(Overview, DOM) {

    Overview.OverviewDOM = function() {
        console.log("[Overview.DOM] Init Overview DOM");
        var self = this,
            subscriptions = [];

        var _subscribe = function(name, callback) {
            subscriptions[name] = subscriptions[name] || [];
            subscriptions[name].push(callback);
        };

        var _call = function(name, data) {
            for(var _name in subscriptions) {
                if(_name == name) {
                    var callbacks = subscriptions[name];
                    callbacks.forEach(function(callback) {
                        callback(data);
                    });
                }
            }
        };

        var elts = {
            $middleColumn : DOM.$elt('.column-middle'),
            $overview : DOM.$elt('.overview'),
            $dashboard : DOM.$elt('a[href=#dashboard]'),
            $chart : DOM.$elt('#chart')
        };

        var tmpl = _.template($("#overview_tmpl").html()),
            tmplChartLegend = _.template($("#overview_chart_legend_tmpl").html());

        this.onProjectClick = function(next) {
            _subscribe('overview-legend', next);
        };

        this.drawSummary = Action(function(data, next) {
            var inputs = [],
                projects = [],
                levels = [];

            if (data.summary.length) {
                var addToLevels = function(level) {
                    var found = levels.filter(function(l) {
                        return level == l;
                    });
                    if(!found.length) levels.push(level);
                };

                data.summary.forEach(function(proj, projIndex) {
                    projects.push(proj.project);
                    proj.counters.forEach(function(counter, index) {
                        addToLevels(counter.level);
                        inputs[index] = inputs[index] ||  [];
                        inputs[index].push({ x: projIndex, y: counter.count});
                    });
                });

                var onClickAxisX = function(project) {
                    _call('overview-legend', project);
                };

                var renderLegend = function(colors) {
                    elts.$overview().prepend(tmplChartLegend({
                        levels: levels,
                        colors: colors
                    }));
                };

                Charts.drawStackedBars(
                        inputs,
                        projects,
                        elts.$chart()[0],
                        { start: "#91adc7", end: "#637a8f" },
                        onClickAxisX,
                        renderLegend
                        );
            }

            next(data);
       });

        this.render = function() {
            elts.$middleColumn().html(tmpl({}));
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
