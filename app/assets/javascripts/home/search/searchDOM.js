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

         this.typedQuery = function(evt) {
             console.log($(evt.currentTarget).val().split(' '));
             return $(evt.currentTarget).val().split(' ');
         };
     };

 })(window.PlayStory.Init.Home.Search);