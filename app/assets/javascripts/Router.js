/**
 * Router.js
 */

(function(PlayStory, RouterUtils) {

    PlayStory.Router = (function() {
        console.log("[PlayStory.Router] Init play story router");

        var self=this,
            subscribers = [];

        var currentRoute = function() {
            return window.location.hash.substr(1,window.location.hash.length);
        };

        var loadURL = function() {
            subscribers.forEach(function(callback, index) {
                callback({
                    newURL: '#' + currentRoute()
                });
            });
        };

        var onRouteChange = function(next) {
            subscribers.push(next);
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
                loadURL();
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
                        lazy: function(futureActions) {
                            console.log("hey");
                            var A = Action(function(any, next) {
                                var actions = futureActions().reduce(function(prevAction, currentAction) {
                                    return prevAction.then(currentAction);
                                });
                                this.then(actions);
                                next(any);
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
                var router = When(onRouteChange)
                             .map(function(evt) {
                                 return evt.newURL.split('#')[1];
                             });
                router.filter(function() {
                    alert('history');
                    return history.state ? (history.state.prev == prev) : false;
                });
                return {
                    when: PureRouter(router)
                };
            };

            this.fromStart = function() {
                var router = newRouter();
                router.filter(function() {
                    return !history.state || !history.state.prev;
                });
                return {
                    when: PureRouter(router)
                };
            };

            this.go = function(route, trigger) {
                history.pushState({ prev: currentRoute() }, route, "#" + route);
                if(trigger) loadURL();
            };

            this.forward = function() {
                history.forward();
            };

            this.back = function() {
                history.back();
            };

            this.goAsAction = function(uriPattern, buildURI, trigger) {
                return Action(function(any, next) {
                    var uri = buildURI(uriPattern, any);
                    self.go(uri, trigger);
                    next(any);
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