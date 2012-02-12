$(document).ready(function() {
    var session = {};
    session.$matchedLogs = [];

    session.ui = {
        buttons: {
            $start: $('div#cmds #stopped #start'),
            $stop: $('div#cmds #started #stop'),
            $clear: $('div#cmds #started #clear')
        },
        inputs: {
            $keywords: $('div#cmds #narrow input[type="text"]')
        },
        containers: {
            $logs: $('div#logs ul'),
            $stream: $('iframe#stream'),
            $cmds: $('div#cmds')
        }
    };

    session.onReceive = function(log) {
        var cssID = '',
            cssClass = 'log',
            logID = log.message.match('#[\\w]* '),
            logClass = log.message.match('\\.[\\w]* ');

        if(logClass) cssClass += ' ' + logClass[0].substring(1,logClass[0].length);
        if(logID) cssID = logID[0].substring(1,logID[0].length);
        if(logClass || logID) {
            cssClass += ' variable';
            log.message = log.message.slice(1);
        }
        this.ui.containers.$logs.append('<li class="'+cssClass+'" id="'+cssID+'">'+ log.message +'</li>');
        this.ui.containers.$logs.find('li.log').last().fadeIn(1000);
    };

    var bindUI = function() {
        session.ui.buttons.$start.click(function(e) {
            e.preventDefault();
            session.ui.buttons.$start.parent().hide();
            session.ui.buttons.$stop.parent().show();
            var url = 'story/listen';
            var keywords = session.ui.inputs.$keywords.val();
            if(keywords) url = url.concat('/{keywords}'.replace('{keywords}', keywords));
            session.ui.containers.$stream.attr('src', url);
        });

        session.ui.buttons.$stop.click(function(e) {
            e.preventDefault();
            session.ui.buttons.$start.parent().show();
            session.ui.buttons.$stop.parent().hide();
            session.ui.containers.$stream.attr('src', '#');
        });

        session.ui.buttons.$clear.click(function(e) {
            session.ui.containers.$logs.empty();
        });

        session.ui.inputs.$keywords.keypress(function(e) {
           if(e.which == 13) e.preventDefault();
        });

        session.ui.inputs.$keywords.keyup(function(e) {
            e.preventDefault();
            var keywords = $.trim($(this).val());
            $logs = session.ui.containers.$logs.find('li.log');
            $logs.removeClass('found');
            if(keywords) {
                session.$matchedLogs = $logs.filter(function() {
                   return $(this).text().search(keywords) > -1;
                });
                if(session.$matchedLogs.length > 0) {
                   var $firstMatched = session.$matchedLogs.first();
                   session.$matchedLogs.each(function() {
                       $(this).addClass('found');
                   });
                    $('html, body').animate({ scrollTop: $firstMatched.offset().top - 250}, 'fast');
                }
            } else window.scroll(0, 0);
        });
    };

    bindUI();
    window.session = session;
});
