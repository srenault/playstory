$(document).ready(function() {
    var session = {};

    session.$matchedLogs = [];

    session.onReceive = function(log) {
        $('#logs ul').append('<li class="log">'+ log.message +'</li>');
        $('#logs li.log').last().fadeIn(1000);
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
            $keywords: $('div#cmds #narrow input[type="text"]')
        };

        var $stream = $('#stream');
        buttons.$start.click(function(e) {
            e.preventDefault();
            containers.$stopped.hide();
            containers.$started.show();
            var url = 'story/listen';
            var keywords = inputs.$keywords.val();
            if(keywords) url = url.concat('/{keywords}'.replace('{keywords}', keywords));
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

        inputs.$keywords.keyup(function(e) {
            e.preventDefault();
            var _this = this;
            session.$matchedLogs = containers.$logs.find('li.log').filter(function() { 
               return $(this).text().search($(_this).val()) > -1;
            });
            if(session.$matchedLogs.length > 0) {
                var $firstMatched = session.$matchedLogs.first();
                $firstMatched.css('background-color', 'blue');
                var posY = $firstMatched.offset().top - 50; //$firstMatched.css('padding-top') + $firstMatched.css('margin-top');
                window.scroll(0, posY);
            }
        });
    };

    session.bindUI();
    window.session = session;
});
