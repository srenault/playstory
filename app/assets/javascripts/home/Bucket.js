/**
 * Bucket.js
 */

(function(Home) {

    Home.Bucket  = function() {

        var _collections = [],
            _models = [];

        this.collections = (function() {
            return {
                get: function(name) {
                    return _collections[name];
                },
                set: function(name, collection) {
                    _collections[name] = collection;
                },
                remove: function(name) {
                    _collections[name] = null;
                    _collections = _collections.filter(function(collection) {
                        return collection != null;
                    });
                },
                view: function() {
                    return _collections;
                }
            };
        })();

        this.models = (function(name) {
            return {
                get: function(name) {
                    return _models[name];
                },
                set: function(name, model) {
                    _models[name] = model;
                },
                remove: function(name) {
                    _models[name] = null;
                    _models = _models.filter(function(model) {
                        return model != null;
                    });
                },
                view: function() {
                    return _models;
                }
            };
        })();
    };
})();
