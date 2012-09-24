/**
 * Router.js
 */

(function(PlayStory, RouterUtils) {

    PlayStory.Router = (function() {
        console.log("[PlayStory.Router] Init play story router");

        var self=this,
            subscribers = [],
            previousRoute;

        var currentRoute = function() {
            return window.location.hash.substr(1,window.location.hash.length);
        };

        var loadURL = function() {
            var newURI = { newURL: '#' + currentRoute() };
            subscribers.forEach(function(callback, index) {
                callback(newURI);
            });
        };

        var loadLastURL = function() {
            var newURI = { newURL: '#' + currentRoute() };
            subscribers[subscribers.length-1](newURI);
        };

        var onRouteChange = function(next) {
            subscribers.push(next);
            window.addEventListener('hashchange', function(evt) {
                previousRoute = evt.oldURL.split('#')[1];
            });
            window.addEventListener('hashchange', next);
        };

        var newRouter = function() {
            return When(onRouteChange)
                   .map(function(evt) {
                       return evt.newURL.split('#')[1];
                   });
        };

        var defaultRouter = newRouter();

        var matchParams = function(routeAsRegex) {
            return Action(function(route, next) {
                var params= RouterUtils.matchParams(currentRoute(), routeAsRegex);
                next(params);
            });
        };

        var subscribe = function(router, route, actions) {
            var routeAsRegex = RouterUtils.routeAsRegex(route);

            actions.unshift(matchParams(routeAsRegex));
            var composedActions = actions.reduce(function(prevAction, currentAction) {
                return prevAction.then(currentAction);
            });

            var r = Match.regex(routeAsRegex, matchParams(routeAsRegex).then(composedActions));
            router.match(r).subscribe();

            if(routeAsRegex.test(currentRoute())) {
                loadLastURL();
            }
        };

        var PureRouter = function(router) {
            return function(route, action) {
                if(action) {
                    subscribe(router, route, [action]);
                    return null;
                } else {
                    return {
                        chain: function() {
                            var actions = [];
                            for(var index = 0; index<arguments.length; index++) {
                                actions.push(arguments[index]);
                            }
                            subscribe(router, route, actions);
                            return {
                                and: function() {
                                    var mergedActions = [];
                                    for(var index = 0; index<arguments.length; index++) {
                                        mergedActions.push(arguments[index]);
                                    }
                                    subscribe(router, route, mergedActions);
                                    return this;
                                }
                            };
                        },
                        lazy: function(actions) {
                            var A = Action(function(any, next) {
                                actions().onComplete(next)._do(any);
                            });
                            subscribe(router, route, [A]);
                        }
                    };
                };
            };
        };

        return new (function() {
            var self = this;

            this.currentRoute = currentRoute;

            this.when = PureRouter(defaultRouter);

            this.from = function(prev) {
                var prevRouteAsRegex = RouterUtils.routeAsRegex(prev);
                var router = When(onRouteChange).map(function(evt) {
                    return evt.newURL.split('#')[1];
                }).filter(function() {
                    return prevRouteAsRegex.test(previousRoute);
                });
                return {
                    when: PureRouter(router)
                };
            };

            this.fromStart = function() {
                var router = When(onRouteChange).map(function(evt) {
                    return evt.newURL.split('#')[1];
                }).filter(function() {
                    return !previousRoute;
                });
                return {
                    when: PureRouter(router)
                };
            };

            this.go = function(route, trigger) {
                previousRoute =  currentRoute();
                history.pushState({ }, route, "#" + route);
                if(trigger) loadLastURL();
            };

            this.forward = function() {
                history.forward();
            };

            this.back = function() {
                history.back();
            };

            this.goAsAction = function(uriPattern, buildURI, trigger) {
                return Action(function(params, next) {
                    var uri = buildURI.apply(null, [uriPattern].concat(arguments[0]));
                    self.go(uri, trigger);
                    next(params);
                });
            };

            this.isMatchCurrentRoute = function() {
                for(var index = 0; index<arguments.length; index++) {
                    var uriPattern = arguments[index];
                    var routeAsRegex = RouterUtils.routeAsRegex(uriPattern);
                    return routeAsRegex.test(currentRoute());
                }
            };

            this.matchCurrentRoute = function(patternURI) {
                var routeAsRegex = RouterUtils.routeAsRegex(patternURI);
                return RouterUtils.matchParams(currentRoute(), routeAsRegex);
            };
        })();
    })();

})(window.PlayStory || {}, window.RouterUtils || {});