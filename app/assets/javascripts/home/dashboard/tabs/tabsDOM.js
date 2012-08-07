/**
 * tabsDOM.js
 */

(function(Tabs) {

     Tabs.TabsDOM = function() {
         console.log("[Tabs.DOM] Init tabs DOM");
         var self = this;

         //DOM elements
         var elts = {
             $middleColumn: function() { return $('.column-middle'); },
             $tabs: function() { return $('.tabs'); },
             $presentTab: function() { return $('.tabs .present'); },
             $pastTab: function() { return $('.tabs .past'); },
             $pastPannel: function() { return $('.feeds.past'); },
             $presentPannel: function() { return $('.feeds.present'); }
         };

         var tmpl = _.template($("#tabs_tmpl").html());

         this.render = function() {
             elts.$middleColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$tabs().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         this.onPastTabClick = function(next) {
             elts.$pastTab().find('a').click(next);
         };

         this.onPresentTabClick = function(next) {
             elts.$presentTab().find('a').click(next);
         };

         this.turnOnPastTab = Action(function(evt, next) {
             elts.$pastTab().addClass('on');
             elts.$pastPannel().show();
             elts.$presentTab().removeClass('on');
             elts.$presentPannel().hide();
             next(evt);
         });

         this.turnOnPresentTab = Action(function(evt, next) {
             elts.$presentTab().addClass('on');
             elts.$presentPannel().show();
             elts.$pastTab().removeClass('on');
             elts.$pastPannel().hide();
             next(evt);
         });

         this.refreshNavigation = Action(function(params, next) {
             var pastURL = '#past/:project'.replace(':project', params[0]);
             elts.$pastTab().find('a').attr('href', pastURL);

             var presentURL = '#present/:project'.replace(':project', params[0]);
             elts.$presentTab().find('a').attr('href', presentURL);
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Dashboard.Tabs);