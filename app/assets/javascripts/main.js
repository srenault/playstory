$(document).ready(function() {
    var session = {};
    session.onReceive = function(log) {
        $('#logs ul').append('<li>'+ log.message +'</li>');
    };

    session.bindUI = function() {
        var buttons = {
            $start: $('div#cmds #stopped #start'),
            $stop: $('div#cmds #started #stop'),
            $clear: $('div#cmds #started #clear')
        };

        var containers = {
            $stopped: $('div#cmds #stopped'),
            $started: $('div#cmds #started'),
            $logs: $('div#logs ul')
        };

        var inputs = {
            $keywords: $('div#cmds #narrow input[type="search"]')
        };

        var $stream = $('#stream');
        buttons.$start.click(function(e) {
            e.preventDefault();
            containers.$stopped.hide();
            containers.$started.show();
            var url = 'story/listen';
            var keywords = inputs.$keywords.val().trim();
            if(keywords != '') url = url.concat('/{keywords}'.replace('{keywords}', keywords));
            $stream.attr('src', url);
        });
        
        buttons.$stop.click(function(e) {
            e.preventDefault();
            containers.$started.hide();
            containers.$stopped.show();
            $stream.attr('src', '#');
        });

        buttons.$clear.click(function(e) {
            containers.$logs.empty();
        });
    };

    session.bindUI();
    window.session = session;
});
