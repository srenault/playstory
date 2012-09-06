/**
 * inboxDOM.js
 */

(function(Inbox) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");
         var self = this,
             bucket = PlayStory.Bucket;

         var $el = function(selector) {
             return function() {
                 return $(selector);
             };
         };

         //DOM elements
         var elts = {
             $leftColumn : $el('.column-left'),
             $inbox : $el('.inbox'),
             $levels : $el('.inbox ul.levels li:not(.all)'),
             $info : $el('.inbox li.info'),
             $debug : $el('.inbox li.debug'),
             $error : $el('.inbox li.error'),
             $fatal : $el('.inbox li.fatal'),
             $trace : $el('.inbox li.trace'),
             $warn : $el('.inbox li.warn'),
             $all : $el(".inbox ul li.all a"),
             $starred : $el(".inbox ul.mainstream li a")
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
             var currentCounter = $counter.text().replace('(','')
                                                 .replace(')','');

             var newCounter = (parseInt(currentCounter) || 0) + 1;
             $counter.text(' (' + newCounter + ')');
         };

         this.initLevels = Action(function(data, next) {
             elts.$inbox().find('li.' + data.counter.level.toLowerCase() + ' a span')
             .text(' ('+ data.counter.count + ')');
             next(data);
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
             next(feed);
         });

         this.summupStarred = Action(function(any, next) {
             summup(elts.$starred().find('span'));
             next(any);
         });

         this.updateStarred = Action(function(any, next) {
             var user = bucket.models('user').get();
             var label = '(:counter)'.replace(':counter', user.bookmarkIds.length);
             elts.$starred().find('span').text(label);
             next(any);
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

 })(window.PlayStory.Init.Dashboard.Inbox);