/**
 * searchDOM.js
 */

(function(Search) {

     Search.SearchDOM = function() {
         console.log("[Search.DOM] Init Search DOM");
         var self = this;

         //DOM elements
         var elts = {
             $content: function() { return $('.content'); },
             $searchContainer : function() { return $('.search'); },
             $search : function() { return $('.search input[name=search]'); }
         };

         var tmpl = _.template($("#search_tmpl").html());

         this.render = function() {
             elts.$content().prepend(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$content().empty();
         };

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
             var keywords = params[1].match(/keywords=([\w]*)/g).map(function(keyword) {
                 return keyword.split('=')[1];
             }).join(' ');
             elts.$search().val(keywords);
             next(params);
         });

         this.clearSearch = Action(function(params, next) {
             elts.$search().val('');
             next(params);
         });
     };

 })(window.PlayStory.Init.Dashboard.Search);