/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsServer = function(bucket) {
        console.log("[Feeds.Server] Init feeds server");

        this.bucket = bucket;

        var self = this,
            subscriptions = [],
            sources = [],
            currentSource = null;

        var _subscribe = function(uri, callback) {
            subscriptions[uri] = subscriptions[uri] || [];
            subscriptions[uri].push(callback);
        };

        var _alreadyConnected = function(uri) {
            for(var source in sources) {
                if(RouterUtils.routeAsRegex(uri).test(source)) return true;
            }
            return false;
        };

        var _streamChunks = function(feed) {
            var subscribers = [];
            for(var uri in subscriptions) {
                if(RouterUtils.routeAsRegex(uri).test(feed.src)) {
                    subscribers = subscriptions[uri];
                    break;
                }
            }

            subscribers.forEach(function(s) {
                s(feed);
            });
        };

        var _closeStream = function(wishedSource) {
            if(wishedSource) {
                console.log('[Feeds.Server] Closing ' + wishedSource);
                for(sourceName in sources) {
                    if(sourceName == wishedSource) {
                        var source = sources[wishedSource];
                        subscriptions[wishedSource] = null;
                        subscriptions.filter(function(src) {
                            return src != null;
                        });
                        source.close();
                        return true;
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
                    currentSource = uri;
                }
                next(params);
            });
        };

        this.fetch = function(uriPatten, buildURI) {
            return Action(function(params, next) {
                var uri = buildURI(uriPatten, params);
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    success: function(feeds) {
                        feeds.forEach(function(feed) {
                            _streamChunks(JSON.parse(feed));
                        });
                        next(params);
                    },
                    error: function() {
                        next(params);
                    }
                });
            });
        };

        this.closeCurrentStream = Action(function(params, next) {
            _closeStream(currentSource);
            currentSource = null;
            next(params);
        });

        /**
         * Comment one log.
         */
        this.saveNewComment = Action(function(comment, next) {
            console.log("[FeedsPast.Server] Save new comment");
            var authorId = self.bucket.models('user').id;

            $.ajax({
                url: '/story/:project/log/:id'.replace(':id', comment.id)
                                              .replace(':project', comment.project),
                type: 'POST',
                data: JSON.stringify({ author: authorId, message: comment.msg}),
                dataType: 'json',
                contentType: 'application/json',
                success: next
            });
            next(comment);
        });
    };
})(window.PlayStory.Init.Home.Feeds);