/**
 * tabsDOM.js
 */

(function(Tabs, DOM) {

     Tabs.TabsDOM = function() {
         console.log("[Tabs.DOM] Init tabs DOM");
         var self = this;

         var elts = {
             $middleColumn: DOM.$elt('.column-middle'),
             $tabs: DOM.$elt('.tabs'),
             $presentTab: DOM.$elt('.tabs .present'),
             $pastTab: DOM.$elt('.tabs .past'),
             $pastPannel: DOM.$elt('.feeds.past'),
             $presentPannel: DOM.$elt('.feeds.present')
         };

         var tmpl = _.template($("#tabs_tmpl").html());

         this.render = function() {
            console.log("[Dashboard] Rendering TabsView");
             elts.$middleColumn().append(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$tabs().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

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

         this.refreshNavigation = Action(function(project, next) {
             var pastURL = '#dashboard/past/:project'.replace(':project', project);
             elts.$pastTab().find('a').attr('href', pastURL);

             var presentURL = '#dashboard/present/:project'.replace(':project', project);
             elts.$presentTab().find('a').attr('href', presentURL);
             next(project);
         });
     };

 })(window.PlayStory.Init.Dashboard.Tabs, window.DOM);