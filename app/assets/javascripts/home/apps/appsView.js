/**
 * appsView.js
 */

(function(Apps) {

    Apps.AppsView = function() {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        //Init
       this.dom = new Apps.AppsDOM();
    };

})(window.PlayStory.Init.Home.Apps);

