/**
 * searchView.js
 */

(function(PlayStory, Search, Router) {

    Search.SearchView = function(pastDOM) {
        console.log("[Search.View] Init Search view");

        var self = this,
            modelsDef = PlayStory.ModelsDef,
            server = PlayStory.Server;

        //Init
        this.dom = new Search.SearchDOM();

        this.lazyInit = function() {
            var goSearchedFeed = Router.goAsAction('past/:project/search/:query', function(uriPattern, query) {
                return uriPattern.replace(':project', query.project)
                    .replace(':query', query.keywords);
            }, true);

            When(this.dom.onTypingEnter)
                .map(this.dom.typedKeywords)
                .map(function(keywords) {
                    keywords = 'keywords=' + keywords.reduce(function(query, keyword) {
                        return (query + '&keywords=' + keyword);
                    });

                    return {
                        keywords: keywords,
                        project: 'onconnect'
                    };
            }).await(goSearchedFeed).subscribe();
        };
    };

})(window.PlayStory,
   window.PlayStory.Init.Dashboard.Search,
   window.PlayStory.Router);
