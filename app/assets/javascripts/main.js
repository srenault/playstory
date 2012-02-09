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
        this.ui.containers.$logs.append('<li class="log">'+ log.message +'</li>');
        this.ui.containers.$logs.find('li.log').last().fadeIn(1000);
        this.ui.containers.$cmds.addClass('onreceived');
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
            session.ui.buttons.$start.hide();
            session.ui.buttons.$stop.show();
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
                    $('html, body').animate({ scrollTop: $firstMatched.offset().top - 250}, 'slow');
                }
            } else window.scroll(0, 0);
        });
    };

    bindUI();
    window.session = session;
});
