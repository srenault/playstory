/**
 * searchDOM.js
 */

(function(Search, DOM) {

     Search.SearchDOM = function() {
         console.log("[Search.DOM] Init Search DOM");
         var self = this;

         //DOM elements
         var elts = {
             $content: DOM.$elt('.content'),
             $searchContainer : DOM.$elt('.search'),
             $search : DOM.$elt('.search input[name=search]')
         };

         var tmpl = _.template($("#search_tmpl").html());

         this.render = function() {
             console.log("[Dashboard] Rendering SearchView");
             elts.$content().prepend(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$content().empty();
         };

         this.destroyAsAction = asAction(self.destroy);

         this.onTypingEnter = function(next) {
             elts.$search().on('keydown', function(evt) {
                 if(evt.keyCode == 13) {
                     evt.preventDefault();
                     next(evt);
                 }
             });
         };

         this.typedKeywords = function(evt) {
             return $(evt.currentTarget).val().split(' ');
         };

         this.fillSearch = Action(function(params, next) {
             var project = params[0],
                 keywords = params[1];
             var words = keywords.match(/keywords=([\w]*)/g).map(function(word) {
                 return word.split('=')[1];
             }).join(' ');
             elts.$search().val(words);
             next(params);
         });

         this.clearSearch = Action(function(params, next) {
             elts.$search().val('');
             next(params);
         });
     };

 })(window.PlayStory.Init.Dashboard.Search, window.DOM);