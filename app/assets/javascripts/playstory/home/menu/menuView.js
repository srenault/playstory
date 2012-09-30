/**
 * menuView.js
 */

(function(Menu, Router) {

    Menu.MenuView = function(server) {
        console.log("[Menu.View] Init Menu view");
        var self = this;

        this.dom = new Menu.MenuDOM();

        this.lazyInit = function() {
        };
    };

})(window.PlayStory.Init.Home.Menu,
   window.PlayStory.Router);