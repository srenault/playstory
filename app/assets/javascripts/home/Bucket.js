/**
 * Bucket.js
 */

(function(Home) {

    Home.Bucket  = function() {

        var _collections = [],
            _models = [];

        this.collections = function(name) {

            return new (function() {
                var self = this;

                this.get = function() {
                    return _collections[name];
                };

                this.set = function(collection) {
                    _collections[name] = collection;
                };

                this.put = function(model) {
                    _collections[name] = _collections[name] || [];
                    _collections[name].push(model);
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

                this.putAsAction = Action(function(model, next) {
                    self.put(model);
                    next(model);
                });

                this.destroyAsAction = Action(function(any, next) {
                    this.destroy(name);
                    next(any);
                });

                this.resetAsAction = Action(function(any, next) {
                    _collections = [];
                    next(any);
                });

                this.asFifo = Action(function(any, next) {
                    next(any);
                });
            })();
        };
    };
})(window.PlayStory.Init.Home);
