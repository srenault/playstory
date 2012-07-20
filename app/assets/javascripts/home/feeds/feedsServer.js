/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsServer = function(bucket) {
        console.log("[Feeds.Server] Init feeds server");

        this.bucket = bucket;

        var self = this,
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

        var _streamChunks = function(feed) {
            var subscribers = [];
            if(feed.src) {
                for(var uri in subscriptions) {
                    if(RouterUtils.routeAsRegex(uri).test(feed.src)) {
                        subscribers = subscriptions[uri] || [];
                        break;
                    }
                }

                if(subscribers.length == 0) {
                    console.log("[Feed.Server] [!!!!!] No subscribers found for " + feed.src);
                }

                subscribers.forEach(function(s) {
                    s(feed);
                });
            } else console.log("[Feed.Server] [!!!!!] No source specified");
        };

        var _closeStream = function(uri) {
            if(uri) {
                for(var sourceName in sources) {
                    if(RouterUtils.routeAsRegex(uri).test(sourceName) && sources[sourceName] != null) {
                        console.log('[Feeds.Server] Close ' + sourceName + ' -> ' + uri);
                        var source = sources[sourceName];
                        sources[sourceName] = null;
                        source.close();
                    }
                }
            }
            return false;
        };

        this.fromPulling = function(feed) {
            _streamChunks(JSON.parse(feed.data));
        };

        this.fromTemplate = function(name, feed) {
            var wrappedFeed = {
                src : '/template',
                data : feed,
                name: name
            };
            _streamChunks(wrappedFeed);
        };

        this.onReceive = function(uri) {
            console.log("[Feeds.Server] Subscribe to " + uri);
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
                    console.log("[Feeds.Server] Bind to stream " + uri);
                    var source = new EventSource(uri);
                    source.onmessage = function(chunk) {
                        _streamChunks(JSON.parse(chunk.data));
                    };
                    sources[uri] = source;
                }
                next(params);
            });
        };

        this.streamFeeds = this.stream('/story/:project/listen', function(uriPattern, params) {
            return uriPattern.replace(':project', params[0]);
        }),

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

        this.fetchInbox = this.fetch('/story/:project/inbox', function(uriPattern, params) {
            return uriPattern.replace(':project', params[0]);
        });

        this.fetchFeedsByLevel = this.fetch('/story/:project/level/:level', function(uriPattern, params) {
            return uriPattern.replace(':project', params[0])
                             .replace(':level', params[1]);
        });

        this.fetchLastFeeds = this.fetch('/story/:project/last', function(uriPatten, params) {
            return uriPatten.replace(':project', params[0]);
        });

        this.closeStream = function(uriPattern) {
            return Action(function(params, next) {
                var nextURI = uriPattern.replace(':project', params[0]);
                if(!_alreadyConnected(nextURI)) {
                    _closeStream(uriPattern);
                }
                next(params);
            });
        };

        this.bookmark = Action(function(bookmark, next) {
            var uri = '/story/:project/log/:id/bookmark'.replace(':id', bookmark.feed)
                                                        .replace(':project', bookmark.project);
            $.ajax({
                url: uri,
                type: 'POST',
                dataType: 'json',
                success: function() {
                    next(bookmark);
                }
            });
        });

        this.saveNewComment = Action(function(comment, next) {
            console.log("[Feeds.Server] Save new comment");
            var authorId = self.bucket.models('user').get().id;

            $.ajax({
                url: '/story/:project/log/:id'.replace(':id', comment.id)
                                              .replace(':project', comment.project),
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
})(window.PlayStory.Init.Home.Feeds);