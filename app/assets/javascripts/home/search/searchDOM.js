/**
 * searchDOM.js
 */

(function(Search) {

     Search.SearchDOM = function() {
         console.log("[Search.DOM] Init Search DOM");

         //DOM elements
         var elts = new (function() {
             this.$searchContainer = $('.search');
             this.$search = this.$searchContainer.find('input[name=search]');
         })();

         this.onTypingEnter = function(next) {
             elts.$search.on('keydown', function(evt) {
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
             elts.$search.val(keywords);
             next(params);
         });

         this.clearSearch = Action(function(params, next) {
             elts.$search.val('');
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Search);