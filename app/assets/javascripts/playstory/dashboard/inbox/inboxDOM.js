/**
 * inboxDOM.js
 */

(function(Inbox, DOM) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");
         var self = this,
             bucket = PlayStory.Bucket;

         var elts = {
             $leftColumn : DOM.$elt('.column-left'),
             $inbox : DOM.$elt('.inbox'),
             $levels : DOM.$elt('.inbox ul.levels li:not(.all)'),
             $info : DOM.$elt('.inbox li.info'),
             $debug : DOM.$elt('.inbox li.debug'),
             $error : DOM.$elt('.inbox li.error'),
             $fatal : DOM.$elt('.inbox li.fatal'),
             $trace : DOM.$elt('.inbox li.trace'),
             $warn : DOM.$elt('.inbox li.warn'),
             $all : DOM.$elt(".inbox ul li.all a"),
             $starred : DOM.$elt(".inbox ul.mainstream li a")
         };

         var tmpl = _.template($("#inbox_tmpl").html());

         this.render = function() {
            console.log("[Dashboard] Rendering InboxView");
             elts.$leftColumn().append(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$inbox().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

         var summup = function($counter) {
             var currentCounter = $counter.text().replace('(','')
                                                 .replace(')','');

             var newCounter = (parseInt(currentCounter, 10) || 0) + 1;
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

 })(window.PlayStory.Init.Dashboard.Inbox, window.DOM);