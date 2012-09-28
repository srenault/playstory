/**
 * Server.js
 */

(function(Home) {

    Home.Server = function() {
        console.log("[Server] Init Server");

        this.urls = {
            summary:        PlayRoutes.controllers.Home.summary().url,
            allProjects:    PlayRoutes.controllers.Home.allProjects().url,
            createProject:  PlayRoutes.controllers.Home.createProject().url,
            follow:         function (project) { return PlayRoutes.controllers.Home.follow(project).url; },
            unfollow:       function (project) { return PlayRoutes.controllers.Home.unfollow(project).url; }
        };

        var self = this,
            bucket = PlayStory.Bucket,
            subscriptions = [],
            sources = [];

        var _subscribe = function(uri, callback) {
            subscriptions[uri] = subscriptions[uri] || [];
            subscriptions[uri].push(callback);
        };

        var _alreadyConnected = function(uri) {
            for(var sourceName in sources) {
                if(RouterUtils.routeAsRegex(uri).test(sourceName) && sources[sourceName] != null) {
                    return true;
                }
            }
            return false;
        };

        var _streamChunks = function(chunk) {
            var subscribers = [];
            if(chunk.src) {
                for(var uri in subscriptions) {
                    if(RouterUtils.routeAsRegex(uri).test(chunk.src)) {
                        subscribers = subscriptions[uri] || [];
                        break;
                    }
                }

                if(subscribers.length == 0) {
                    console.log("[Server] No subscribers found for " + chunk.src);
                }

                subscribers.forEach(function(s) {
                    s(chunk);
                });
            } else console.log("[Server] No source specified");
        };

        var _closeStream = function(uri) {
            if(uri) {
                for(var sourceName in sources) {
                    if(RouterUtils.routeAsRegex(uri).test(sourceName) && sources[sourceName] != null) {
                        console.log('[Server] Close ' + sourceName + ' -> ' + uri);
                        var source = sources[sourceName];
                        sources[sourceName] = null;
                        source.close();
                    }
                }
            }
            return false;
        };

        this.fromPulling = function(any) {
            _streamChunks(JSON.parse(any.data));
        };

        this.fromTemplate = function(name, any) {
            var wrapped = {
                src : '/template',
                data : any,
                name: name
            };
            _streamChunks(wrapped);
        };

        this.onReceive = function(uri) {
            console.log("[Server] Subscribe to " + uri);
            return When(function(next) {
                _subscribe(uri, next);
            });
        };

        this.onReceiveFromTemplate = function(modelName) {
            return this.onReceive('/template')
                       .filter(function(model) {
                           return model.name == modelName;
                       })
                       .map(function(model) {
                           return model.data;
                       });
        };

        this.stream = function(uriPattern, buildURI) {
            return Action(function(params, next) {
                var uri = buildURI(uriPattern, params);
                if(!_alreadyConnected(uri)) {
                    console.log("[Server] Bind to stream " + uri);
                    var source = new EventSource(uri);
                    source.onmessage = function(chunk) {
                        _streamChunks(JSON.parse(chunk.data));
                    };
                    sources[uri] = source;
                }
                next(params);
            });
        };

        this.streamFeeds = this.stream(this.urls.listen, function(uriPattern, params) {
            return uriPattern.replace(':project', params[0]);
        }),

        this.closeStream = function(uriPattern) {
            return Action(function(params, next) {
                var nextURI = uriPattern.replace(':project', params[0]);
                if(!_alreadyConnected(nextURI)) {
                    _closeStream(uriPattern);
                }
                next(params);
            });
        };

        this.fetch = function(uriPattern, buildURI, asStream) {
            return Action(function(params, next) {
                var uri = uriPattern;
                if(buildURI) uri = buildURI(uriPattern, params);
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    success: function(data) {
                        if(asStream) {
                            data.forEach(function(feed) {
                                _streamChunks(feed);
                            });
                            next(params);
                        } else {
                            _streamChunks(data);
                            next(data);
                        }
                    },
                    error: function() {
                        next(params);
                    }
                });
            });
        };

        this.fetchSummary = this.fetch(this.urls.summary, function(uriPattern, any) {
            return uriPattern;
        });

        this.fetchAllProjects = this.fetch(this.urls.allProjects, function(uriPattern, any) {
            return uriPattern;
        });

        this.createProject = Action(function(project, next) {
            $.ajax({
                url: PlayRoutes.controllers.Home.createProject().url,
                data: JSON.stringify(project),
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                success: function() {
                    next(project);
                }
            });
        });

        this.followOrUnfollow = Action(function (actionAndProject, next) {
            var url;

            if (actionAndProject.action == 'follow')
                url = self.urls.follow(actionAndProject.project);
            else
                url = self.urls.unfollow(actionAndProject.project);

            $.ajax({
                url: url,
                type: 'PUT',
                success: function () {
                    next(actionAndProject);
                }
            })
        });
    };
})(window.PlayStory.Init.Home);
