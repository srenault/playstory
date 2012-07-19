/**
 * tabsDOM.js
 */

(function(Tabs) {

     Tabs.TabsDOM = function() {
         console.log("[Tabs.DOM] Init tabs DOM");

         //DOM elements
         var elts = {
             $presentTab: $('.tabs .present'),
             $pastTab: $('.tabs .past'),
             $pastPannel: $('.feeds.past'),
             $presentPannel: $('.feeds.present')
         };

         this.onPastTabClick = function(next) {
             elts.$pastTab.find('a').click(next);
         };

         this.onPresentTabClick = function(next) {
             elts.$presentTab.find('a').click(next);
         };

         this.turnOnPastTab = Action(function(evt, next) {
             elts.$pastTab.addClass('on');
             elts.$pastPannel.show();
             elts.$presentTab.removeClass('on');
             elts.$presentPannel.hide();
             next(evt);
         });

         this.turnOnPresentTab = Action(function(evt, next) {
             elts.$presentTab.addClass('on');
             elts.$presentPannel.show();
             elts.$pastTab.removeClass('on');
             elts.$pastPannel.hide();
             next(evt);
         });

         this.refreshNavigation = Action(function(params, next) {
             var pastURL = '#past/:project'.replace(':project', params[0]);
             elts.$pastTab.find('a').attr('href', pastURL);

             var presentURL = '#present/:project'.replace(':project', params[0]);
             elts.$presentTab.find('a').attr('href', presentURL);
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Tabs);