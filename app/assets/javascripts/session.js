$(document).ready(function() {
    var session = {
        $matchedLogs: [],
        ui: {},
        observable: {},
        events: {}
    };

    session.ui = {
        cmds: {
            $get: $('div#cmds'),
            $start: $('div#cmds #stopped #start'),
            $stop: $('div#cmds #started #stop'),
            $clear: $('div#cmds #started #clear'),
            $narrow: $('div#cmds #narrow input[type="text"]')
        },
        $logs: $('div#logs ul'),
        $stream: $('iframe#stream')
    };

    session.observable = {
        log: new function() {
            this.subscribers = [];
            this.onReceive = function(f) {
                this.subscribers.push(f);
            };
            this.receive = function(log) {
                this.subscribers.forEach(function(cb) { cb(log); });
            };
        }
    };

    session.events = {
        log: function(next) { session.observable.log.onReceive(next); },
        cmds: {
            start: function(next) { session.ui.cmds.$start.click(next); },
            stop: function(next) { session.ui.cmds.$stop.click(next); },
            clear: function(next) { session.ui.cmds.$clear.click(next); },
            narrow: {
                keypress: function(next) { session.ui.cmds.$narrow.keypress(next); },
                keyup: function(next) { session.ui.cmds.$narrow.keyup(next); }
            }
        }
    };

    session.actions = {
        log: {
            Display: Action(function(v, n) {
                console.log(v);
                n(v);
            })
        }
    };

    Reactive.on(session.events.cmds.start)
    .await(
        Action(function(v, n) {
            session.ui.cmds.$start.parent().hide();
            session.ui.cmds.$stop.parent().show();
            var url = 'story/listen';
            var keywords = session.ui.cmds.$narrow.val();
            if(keywords) url = url.concat('/{keywords}'.replace('{keywords}', keywords));
            session.ui.$stream.attr('src', url);
            n(v);
        }
     ))
     .subscribe();

    Reactive.on(session.events.cmds.stop)
    .await(
        Action(function(v, n) {
            session.ui.cmds.$start.parent().show();
            session.ui.cmds.$stop.parent().hide();
            session.ui.$stream.attr('src', '#');
        }
    ))
    .subscribe();

    Reactive.on(session.events.cmds.clear)
    .await(
        Action(function(v, n) {
            session.ui.$logs.empty();
        }
    ))
    .subscribe();

    Reactive.on(session.events.cmds.narrow.keypress)
    .await(
        Action(function(e, n) {
           if(e.which === 13) e.preventDefault();
        }
    ))
    .subscribe();

    Reactive.on(session.events.cmds.narrow.keyup)
    .await(
        Action(function(v, n) {
            var keywords = $.trim(session.ui.cmds.$narrow.val());
            $logs = session.ui.$logs.find('li.log');
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
            } else $('html, body').animate({ scrollTop: 0}, 'fast');
        }
    ))
    .subscribe();

    Reactive.on(session.events.log)
    .await(
        Action(function(log, n) {
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
            session.ui.$logs.append('<li class="'+cssClass+'" id="'+cssID+'">'+ log.message +'</li>');
            session.ui.$logs.find('li.log').last().fadeIn(1000);
        }
    ))
    .subscribe();

    window.session = session;
});
