(function(window, $) {
    var session = {};
    Session.onReceive = function(log) {
        alert("log received !");
        var projectName = _.template('<%= project %>');
        var messsage = _.template('<%= data.message %>');
        $('#logs').append('<li>'+ log.data.message +'</li>');
    };

    session.bindUI = function() {
        var buttons = {
            $start: $('div.commands #start'),
            $stop: $('div.commands #stop')
        };

        var $results = $('#stream');
        var _this = this;
        buttons.$start.click(function(e) {
            e.preventDefault();
            var url = '/story/listen';
            $results.attr('src', url);
        });
        
        buttons.$stop.click(function(e) {
            e.preventDefault();
            $results.attr('src', '#');
        });
    };

    session.bindUI();
    window.session = session;
})(window, $);