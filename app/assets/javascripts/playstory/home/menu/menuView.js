/**
 * menuView.js
 */

(function(Menu, Router) {

    Menu.MenuView = function(server) {
        console.log("[Menu.View] Init Menu view");
        var self = this;

        //Init
        this.dom = new Menu.MenuDOM();

        this.lazyInit = function() {
            Router.fromStart().when('home*paths', this.dom.renderAsAction);
            Router.from('dashboard*paths').when('home*paths', this.dom.renderAsAction);
        };
    };

})(window.PlayStory.Init.Home.Menu,
   window.PlayStory.Router);