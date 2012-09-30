/**
 * searchView.js
 */

(function(PlayStory, Search, Router) {

    Search.SearchView = function(pastDOM) {
        console.log("[Search.View] Init Search view");

        var self = this,
            modelsDef = PlayStory.ModelsDef,
            server = PlayStory.Server;

        this.dom = new Search.SearchDOM();

        this.lazyInit = Action(function(any, next) {
            var goSearchedFeed = Router.goAsAction('dashboard/past/:project/search/:query', function(uriPattern, params) {
                return uriPattern.replace(':project', params.project)
                                 .replace(':query', params.keywords);
            }, true);

            When(self.dom.onTypingEnter)
                .map(self.dom.typedKeywords)
                .map(function(keywords) {
                    keywords = 'keywords=' + keywords.reduce(function(query, keyword) {
                        return (query + '&keywords=' + keyword);
                    });
                    var params =  Router.currentParams();
                    params.keywords = keywords;
                    return params;
            }).await(goSearchedFeed).subscribe();

            next(any);
        });
    };

})(window.PlayStory,
   window.PlayStory.Init.Dashboard.Search,
   window.PlayStory.Router);
