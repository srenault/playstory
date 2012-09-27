/**
 * utils.js
 */

(function() {
    window.RouterUtils = (function() {
        var namedParam    = /:\w+/g,
            splatParam    = /\*\w+/g,
            escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

        return {
            routeAsRegex: function(route) {
                route = route.replace(escapeRegExp, '\\$&')
                             .replace(namedParam, '([^\/]+)')
                             .replace(splatParam, '(.*?)');

                return new RegExp('^' + route + '$');
            },

            matchParams: function(route, routeAsRegex) {
                var params = routeAsRegex.exec(route);
                if(params) {
                    return params.slice(1);
                }
                return null;
            }
        };
    })();

    window.DOM = {
        $elt: function(selector) {
            return function() { return $(selector); };
        }
    };

    window.asAction = function(action) {
        return Action(function(any, next) {
            action(any);
            next(any);
        });
    };

    window.preventDefault = function(callback) {
        return function(evt) {
            evt.preventDefault();
            callback(evt);
        };
    };

    window.Charts = {
        drawStackedBars: function(input, axisX, elt, rangeColor, onClickAxisX, renderLegend) {
            var n = 4,
                m = 4,
                data = d3.layout.stack()(input),
                color = d3.interpolateHcl(rangeColor.start, rangeColor.end),
                colors = [];

            var margin = 20,
                width = 600,
                height = 300 - .5 - margin;

            var mx = m,
                my = d3.max(data, function(d) {
                    return d3.max(d, function(d) {
                        return d.y0 + d.y;
                    });
                }),
                mz = d3.max(data, function(d) {
                    return d3.max(d, function(d) {
                        return d.y;
                    });
                }),
                x = function(d) { return d.x * width / mx; },
                y0 = function(d) { return height - d.y0 * height / my; },
                y1 = function(d) { return height - (d.y + d.y0) * height / my; },
                y2 = function(d) { return d.y * height / mz; };

            var vis = d3.select(elt)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height + margin);


            var layers = vis.selectAll('g.layer')
                    .data(data)
                    .enter().append('g')
                    .style('fill', function(d, i) {
                        var c = color(i / n - 1);
                        colors.push(c);
                        return c;
                    })
                    .attr('class', 'layer');

            var bars = layers.selectAll('g.bar')
                    .data(function(d) { return d; })
                    .enter().append('g')
                    .attr('class', 'bar')
                    .attr('transform', function(d) { return 'translate(' + x(d) + ',0)'; });

            bars.append('rect')
                .attr('width', x({x: .9}))
                .attr('x', 0)
                .attr('height', 0)
                .transition()
                .delay(function(d, i) { return i * 10; })
                .attr('y', y1)
                .attr('height', function(d) { return y0(d) - y1(d); });

            var labels = vis.selectAll('text.label')
                    .data(data[0])
                    .enter().append('text')
                    .attr('class', 'label')
                    .attr('x', x)
                    .attr('y', height + 6)
                    .attr('dx', x({x: .45}))
                    .attr('dy', '.71em')
                    .attr('text-anchor', 'middle')
                    .append('a')
                    .attr('href', '#')
                    .on('click', function(l) {
                        onClickAxisX(axisX[l.x]);
                    })
                    .text(function(d, i) {
                        return axisX[i];
                    });

            vis.append('line')
                .attr('x1', 0)
                .attr('x2', width - x({x: .1}))
                .attr('y1', height)
                .attr('y2', height);

            renderLegend(colors);
        }
    };
})();
