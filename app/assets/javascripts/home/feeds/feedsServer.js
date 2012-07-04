/**
 * feedsServer.js
 */

(function(Feeds) {

    Feeds.FeedsServer = function(model) {
        console.log("[Feeds.Server] Init feeds server");

        this.model = model;

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
                if(source === uri) return true;
            }
            return false;
        };

        var _streamFeeds = function(feed) {
            var subscribers = subscriptions[feed.src] || [];
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

        var _buildStreamURI = function(project) {
            return '/story/:project/listen'.replace(':project', project);
        };

       var _buildFetchURI = function(project) {
            return '/story/:project/last'.replace(':project', project);
        };

        this.fromPulling = function(feed) {
            _streamFeeds(JSON.parse(feed.data));
        };

        this.fromTemplate = function(name, feed) {
            var wrappedFeed = {
                src : 'template',
                data : feed,
                name: name
            };
            _streamFeeds(wrappedFeed);
        };

        this.onReceiveChunk = function(params) {
            var uri = _buildStreamURI(params);
            console.log("[Feeds.Server] Subscribe to " + uri);
            return function(next) {
                _subscribe(uri, next);
            };
        };

        this.onReceiveFromTmpl = function(next) {
            console.log("[Feeds.Server] Subscribe to template");
            _subscribe('template', next);
        };

        this.onSuccessFetch = function(params) {
            var uri = _buildFetchURI(params);
            console.log("[Feeds.Server] Subscribe to " + uri);
            return function(next) {
                _subscribe(_buildFetchURI(params), next);
            };
        };

        /**
         * Pull new logs.
         */
        this.bindToStream = Action(function(params, next) {
            var uri = _buildStreamURI(params[0]);
            if(params.length > 0 && !_alreadyConnected(uri)) {
                console.log("[Feeds.Server] Bind to stream " + uri);
                var source = new EventSource(uri);
                source.onmessage = function(feed) {
                    _streamFeeds(JSON.parse(feed.data));
                };
                sources[uri] = source;
                currentSource = uri;
            }
            next(params);
        });

        /**
         * Close current stream.
         */
        this.closeCurrentStream = Action(function(params, next) {
            _closeStream(currentSource);
            currentSource = null;
            next(params);
        });

        /**
         * Fetch logs by making a classic GET request.
         */
        this.fetchFeeds = Action(function(params, next) {
            var uri = '/story/:project/last'.replace(':project', params[0]);
            console.log("[Feeds.server] Fetching feeds " + uri);
            $.ajax({
                url: uri,
                dataType: 'json',
                success: function(feeds) {
                    feeds.forEach(function(feed) {
                        _streamFeeds(JSON.parse(feed));
                    });
                    next(params);
                }
            });
        });

        /**
         * Fetch last logs from specified time.
         */
        this.fetchNewFeeds = Action(function(evt, next) {
            console.log("[FeedsPast.Server] Fetching news feeds");
            next(evt);
        });

        /**
         * Comment one log.
         */
        this.saveNewComment = Action(function(comment, next) {
            console.log("[FeedsPast.Server] Save new comment");
            var authorId = self.model.models('user').id;

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