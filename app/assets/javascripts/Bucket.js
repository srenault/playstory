/**
 * Bucket.js
 */

(function(PlayStory) {

    PlayStory.Bucket  = new (function() {

        var _collections = [],
            _models = [],
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

        this.collections = function(name) {

            var collection = function() {
                _collections[name] = _collections[name] || [];
                return _collections[name];
            };

            return new (function() {
                var self = this;

                this.onSet = function(next) {
                    _subscribe('model_' + name, next);
                };

                this.get = function() {
                    return collection();
                };

                this.first = function() {
                    return this.get()[0];
                };

                this.last = function() {
                    var coll = this.get();
                    return coll[coll.length-1];
                };

                this.size = function() {
                    return this.get().length;
                };

                this.set = function(collection) {
                    _call('collect_' + name, collection);
                    _collections[name] = collection;
                };

                this.put = function(model) {
                    collection().push(model);
                };

                this.reset = function() {
                    if(name) {
                        _collections[name] = [];
                    } else {
                        _collections = [];
                    }
                };

                this.destroy = function() {
                    _collections[name] = null;
                    _collections = _collections.filter(function(collection) {
                        return collection != null;
                    });
                };

                this.view = function() {
                    return _collections;
                };

                this.putAsAction = asAction(self.put);

                this.setAsAction = asAction(self.set);

                this.destroyAsAction = asAction(self.destroy);

                this.resetAsAction = asAction(self.reset);

                this.asFifo = function(limit) {
                    return Action(function(model, next) {
                        if(collection().unshift(model) > limit) {
                            collection().pop();
                        }
                        next(model);
                    });
                };
            })();
        };

        this.models = function(name) {

            return new (function() {
                var self = this;

                this.onSet = function(next) {
                    _subscribe('model_' + name, next);
                };

                this.set = function(model) {
                    _models[name] = model;
                    _call('model_' + name, model);
                };

                this.get = function() {
                    return _models[name];
                };

                this.setAsAction = asAction(self.set);
            });
        };
    })();
})(window.PlayStory);
