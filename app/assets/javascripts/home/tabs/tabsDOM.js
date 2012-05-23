/**
 * tabsDOM.js
 */

(function(Tabs) {

     Tabs.TabsDOM = function() {
         console.log("[Tabs.DOM] Init tabs DOM");

         //DOM elements
         var elts = {
             $presentTab: $('.tabs .present'),
             $pastTab: $('.tabs .past')
         };

         this.onPastTabClick = function(next) {
             elts.$pastTab.find('a').click(next);
         };

         this.onPresentTabClick = function(next) {
             elts.$presentTab.find('a').click(next);
         };

         this.turnOnPastTab = Action(function(evt, next) {
             elts.$pastTab.addClass('on');
             elts.$presentTab.removeClass('on');
             next(evt);
         });

         this.turnOnPresentTab = Action(function(evt, next) {
             elts.$presentTab.addClass('on');
             elts.$pastTab.removeClass('on');
             next(evt);
         });
     };

 })(window.PlayStory.Init.Home.Tabs);