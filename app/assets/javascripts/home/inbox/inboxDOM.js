/**
 * inboxDOM.js
 */

(function(Inbox) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");

         //DOM elements
         var elts = new (function() {
             this.$inbox = $('.inbox');
             this.$levels = this.$inbox.find('ul.levels li:not(.all)');
             this.$info = this.$inbox.find('li.info');
             this.$debug = this.$inbox.find('li.debug');
             this.$error = this.$inbox.find('li.error');
             this.$fatal = this.$inbox.find('li.fatal');
             this.$trace = this.$inbox.find('li.trace');
             this.$warn = this.$inbox.find('li.warn');
             this.$all = this.$inbox.find("ul li.all a");
             this.$starred = this.$inbox.find("ul.mainstream li a");
         })();

         var summup = function($counter) {
             var currentCounter = $counter.text().replace(' (','')
                     .replace(')','');
             var newCounter = parseInt(currentCounter) + 1;
             $counter.text(' (' + newCounter + ')');
         };

         this.initLevels = Action(function(data, next) {
             elts.$inbox.find('li.' + data.counter.level.toLowerCase() + ' a span')
             .text(' ('+ data.counter.count + ')');
         });

         this.updateLevels = Action(function(feed, next) {
             switch(feed.level) {
             case "info": summup(elts.$info.find('span'));
                 break;
             case "debug": summup(elts.$debug.find('span'));
                 break;
             case "error": summup(elts.$error.find('span'));
                 break;
             case "fatal": summup(elts.$fatal.find('span'));
                 break;
             case "trace": summup(elts.$trace.find('span'));
                 break;
             case "warn": summup(elts.$warn.find('span'));
                 break;
             default: console.log("[Inbox.DOM] unknown level " + feed.level);
                 break;
             }
         });

         this.updateStarred = Action(function(feed, next) {
             summup(elts.$starred.find('span'));
         });

         this.refreshNavigation = Action(function(params, next) {
             var noFilterURL = '#past/:project'.replace(':project', params[0]);
             elts.$all.attr('href', noFilterURL);

             elts.$levels.each(function(index, level) {
                 var $level = $(level),
                     levelStr = $level.attr('class');

                 if(levelStr) {
                     var uri = ('#past/:project/level/' + levelStr).replace(':project', params[0]);
                     $level.find('a').attr('href', uri);
                 }
             });
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Inbox);