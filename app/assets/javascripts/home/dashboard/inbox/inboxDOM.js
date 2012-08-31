/**
 * inboxDOM.js
 */

(function(Inbox) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");
         var self = this;

         //DOM elements
         var elts = {
             $leftColumn : function() { return $('.column-left'); },
             $inbox : function() { return $('.inbox'); },
             $levels : function() { return $('.inbox ul.levels li:not(.all)'); },
             $info : function() { return $('.inbox li.info'); },
             $debug : function() { return $('.inbox li.debug'); },
             $error : function() { return $('.inbox li.error'); },
             $fatal : function() { return $('.inbox li.fatal'); },
             $trace : function() { return $('.inbox li.trace'); },
             $warn : function() { return $('.inbox li.warn'); },
             $all : function() { return $(".inbox ul li.all a"); },
             $starred : function() { return $(".inbox ul.mainstream li a"); }
         };

         var tmpl = _.template($("#inbox_tmpl").html());

         this.render = function() {
             elts.$leftColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$inbox().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         var summup = function($counter) {
             var currentCounter = $counter.text().replace(' (','')
                     .replace(')','');
             var newCounter = parseInt(currentCounter) + 1;
             $counter.text(' (' + newCounter + ')');
         };

         this.initLevels = Action(function(data, next) {
             elts.$inbox().find('li.' + data.counter.level.toLowerCase() + ' a span')
             .text(' ('+ data.counter.count + ')');
         });

         this.updateLevels = Action(function(feed, next) {
             switch(feed.level) {
             case "info": summup(elts.$info().find('span'));
                 break;
             case "debug": summup(elts.$debug().find('span'));
                 break;
             case "error": summup(elts.$error().find('span'));
                 break;
             case "fatal": summup(elts.$fatal().find('span'));
                 break;
             case "trace": summup(elts.$trace().find('span'));
                 break;
             case "warn": summup(elts.$warn().find('span'));
                 break;
             default: console.log("[Inbox.DOM] unknown level " + feed.level);
                 break;
             }
         });

         this.updateStarred = Action(function(feed, next) {
             summup(elts.$starred().find('span'));
         });

         this.refreshNavigation = Action(function(params, next) {
             var noFilterURL = '#dashboard/past/:project'.replace(':project', params[0]);
             elts.$all().attr('href', noFilterURL);

             elts.$levels().each(function(index, l) {
                 var $level = $(l),
                     level = $level.attr('class');

                 if(level) {
                     var uri = ('#dashboard/past/:project/level/' + level).replace(':project', params[0]);
                     $level.find('a').attr('href', uri);
                 }
             });
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Dashboard.Inbox);