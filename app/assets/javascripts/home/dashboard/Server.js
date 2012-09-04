/**
 * Server.js
 */

(function(Dashboard, Feeds) {

    Dashboard.Server = function() {
        console.log("[Server] Init Server");

        this.urls = {
            listen:      PlayRoutes.controllers.Dashboard.listen(':project').url,
            last:        PlayRoutes.controllers.Dashboard.last(':project').url,
            byLevel:     PlayRoutes.controllers.Dashboard.byLevel(':project', ':level').url,
            bookmarks:   PlayRoutes.controllers.Dashboard.bookmarks().url,
            more:        PlayRoutes.controllers.Dashboard.more(':project', ':id', ':level', ':limit').url,
            withContext: PlayRoutes.controllers.Dashboard.withContext(':project', ':id', ':limit').url,
            inbox:       PlayRoutes.controllers.Dashboard.inbox(':project').url,
            bookmark:    PlayRoutes.controllers.Dashboard.bookmark(':project', ':id').url,
            comment:     PlayRoutes.controllers.Dashboard.comment(':project', ':id').url
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
            console.log(chunk);
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

        this.fetch = function(uriPattern, buildURI) {
            return Action(function(params, next) {
                var uri = uriPattern;
                if(buildURI) uri = buildURI(uriPattern, params);
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    success: function(feeds) {
                        feeds.forEach(function(feed) {
                            _streamChunks(feed);
                        });
                        next(params);
                    },
                    error: function() {
                        next(params);
                    }
                });
            });
        };

        this.fetchInbox = this.fetch(this.urls.inbox, function(uriPattern, params) {
            return uriPattern.replace(':project', params[0]);
        });

        this.fetchFeedWithContext = this.fetch(this.urls.withContext, function(uriPattern, params) {
            return uriPattern.replace(':project', params[0])
                             .replace(':id', params[1])
                             .replace(':limit', params[2]);
        });

        this.fetchFeedsByLevel = this.fetch(this.urls.byLevel, function(uriPattern, params) {
            return uriPattern.replace(':project', params[0])
                             .replace(':level', params[1]);
        });

        this.fetchLastFeeds = this.fetch(this.urls.last, function(uriPatten, params) {
            return uriPatten.replace(':project', params[0]);
        });

        this.fetchMoreFeeds = this.fetch(this.urls.more, function(uriPattern, source) {
            var lastFeed = bucket.collections('feeds').last();
            var uri = uriPattern.replace(':project', source.params[0])
                                .replace(':id', lastFeed.id)
                                .replace(':limit', 6);

            console.log(uri);

            if(source.route == 'dashboard/past/:project/level/:level') {
                uri += '?level=' + source.params[1];
            }
            return uri;
        });

        this.searchFeeds = this.fetch('/dashboard/:project/search?:keywords', function(uriPattern, params) {
            return uriPattern.replace(':project', params[0])
                             .replace(':keywords', params[1]);
        });

        this.bookmark = Action(function(bookmark, next) {
            $.ajax({
                url: PlayRoutes.controllers.Dashboard.bookmark(bookmark.project, bookmark.feed).url,
                type: 'POST',
                dataType: 'json',
                success: function() {
                    next(bookmark);
                }
            });
        });

        this.saveNewComment = Action(function(comment, next) {
            console.log("[Server] Save new comment");
            var authorId = bucket.models('user').get().id;

            $.ajax({
                url: PlayRoutes.controllers.Dashboard.comment(comment.project, comment.id).url,
                type: 'POST',
                data: JSON.stringify({ author: authorId, message: comment.msg}),
                dataType: 'json',
                contentType: 'application/json',
                success: function() {
                    next(comment);
                }
            });
        });
    };
})(window.PlayStory.Init.Home.Dashboard,
   window.PlayStory.Init.Home.Feeds);
