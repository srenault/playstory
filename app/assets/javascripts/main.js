$(function(window) {
    var session = {};
    session.onReceive = function(log) {
        var message = _.template('<%= message %>');
        $('#logs').append('<li>'+ message(log) +'</li>');
    };

    session.bindUI = function() {
        var buttons = {
            $start: $('div#cmds #stopped #start'),
            $stop: $('div#cmds #started #stop')
        };

        var containers = {
            $stopped: $('div#cmds #stopped'),
            $started: $('div#cmds #started')
        };

        var $stream = $('#stream');
        buttons.$start.click(function(e) {
            e.preventDefault();
            containers.$stopped.hide();
            containers.$started.show();
            var url = 'story/listen';
            $stream.attr('src', url);
        });
        
        buttons.$stop.click(function(e) {
            e.preventDefault();
            containers.$started.hide();
            containers.$stopped.show();
            $stream.attr('src', '#');
        });
    };

    session.bindUI();
    window.session = session;
})(window);
