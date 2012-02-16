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
            narrow: {
                $get: $('div#cmds #narrow input[type="text"]'),
                $option: $('div#cmds #narrow input[type="checkbox"]')
            }
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
                keypress: function(next) { session.ui.cmds.narrow.$get.keypress(next); },
                keyup: function(next) { session.ui.cmds.narrow.$get.keyup(next); }
            }
        }
    };

    var newLog = function(msg, name, pre) {
        var $log = $('<li class="log"></li>');
        if(name) $log.append('<span class="name">'+name+'</div>');
        if(pre) msg = '<pre>' + msg + '</pre>';
        $log.append('<span class="value">'+msg+'</div>');
        return $log;
    };

    session.actions = {
        log: {
            asTimestamp: Action(function(log, n) {
                var nameValue = log.message.split('=>');
                var msg = nameValue[1] + ' [' + new Date(parseInt(nameValue[1])).toString() + ']';
                var $log = newLog(msg, nameValue[0], true).addClass('variable timestamp');
                session.ui.$logs.append($log);
                n(log);
            }),
            asJson: Action(function(log, n) {
                var nameValue = log.message.split('=>');
                var $log = newLog(nameValue[1], nameValue[0], true).addClass('variable json');
                try {
                    JSON.parse(nameValue[1]);
                    $log.addClass('valid');
                } catch(e) {
                    $log.addClass('invalid');
                }
                session.ui.$logs.append($log);
                n(log);
            }),
            asXml: Action(function(log, n) {
                var nameValue = log.message.split('=>');
                var xml = nameValue[1].replace(/</gm,'&lt;').replace(/>/gm,'&gt;');
                var $log = newLog(xml, nameValue[0], true).addClass('variable xml');
                try {
                    $.parseXML(nameValue[1].replace(/<\?.*\?>/,''));
                    $log.addClass('valid');
                } catch(e) {
                    $log.addClass('invalid');
                }
                session.ui.$logs.append($log);
                n(log);
            }),
            asGroup: Action(function(log, n) {
                var nameValue = log.message.split('=>');
                var $group = session.ui.$logs.find('li.log.'+nameValue[0]);
                if($group.length > 0) {
                    $($group[0]).append('<span class="value">'+nameValue[1]+'</span>');
                } else session.ui.$logs.append(newLog(nameValue[1], nameValue[0]).addClass('variable group' + ' ' + nameValue[0].substring(1, nameValue[0].length-1)));
                n(log);
            }),
            asVariable: Action(function(log, n) {
                var nameValue = log.message.split('=>');
                session.ui.$logs.append(newLog(nameValue[1], nameValue[0]).addClass('variable'));
                n(log);
            }),
            asInfo: Action(function(log, n) {
                var $log = newLog(log.message).addClass('info');
                if(log.level === 'ERROR') $log.addClass('error');
                session.ui.$logs.append($log);
                n(log);
            }),
            display: Action(function(log, n) {
                session.ui.$logs.find('li.log').last().fadeIn(1000);
                n(log);
            })
        },
        logs: {
            preventEnterKey: Match.on(function(e) {
                return e.which;
            })
            .value(13, Action(function(e, n) {e.preventDefault(); n(e);}))
            .action(),

            find: Action(function(v, n) {
                var keywords = $.trim(session.ui.cmds.narrow.$get.val());
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
                n(v);
            }),

            filter: Action(function(v, n) {
                var keywords = $.trim(session.ui.cmds.narrow.$get.val()).split(' ');
                $logs = session.ui.$logs.find('li.log');
                $logs.removeClass('found');
                var flag = true;
                var $otherLogs = [];
                var $logsFound = $logs.filter(function() {
                    var _this = this;
                    keywords.forEach(function(wd) {
                        flag = $(_this).attr('class').search(wd) > -1;
                    });
                    if(flag) $otherLogs.push(this);
                    return !flag;
                }).fadeOut(1000);
                $otherLogs.forEach(function(ol) {
                    $(ol).fadeIn(1000);
                });
            })
        },
        listen: {
            start: Action(function(v, n) {
                session.ui.cmds.$start.parent().hide();
                session.ui.cmds.$stop.parent().show();
                var url = 'story/listen';
                var keywords = session.ui.cmds.narrow.$get.val();
                if(keywords) url = url.concat('/{keywords}'.replace('{keywords}', keywords));
                session.ui.$stream.attr('src', url);
                n(v);
            }),
            stop: Action(function(v, n) {
                session.ui.cmds.$start.parent().show();
                session.ui.cmds.$stop.parent().hide();
                session.ui.$stream.attr('src', '#');
                n(v);
            }),
            clear: Action(function(v, n) {
                session.ui.$logs.empty();
                n(v);
            })
        }
    };

    Reactive.on(session.events.cmds.start)
    .await(session.actions.listen.start)
    .subscribe();

    Reactive.on(session.events.cmds.stop)
    .await(session.actions.listen.stop)
    .subscribe();

    Reactive.on(session.events.cmds.clear)
    .await(session.actions.listen.clear)
    .subscribe();

    Reactive.on(session.events.cmds.narrow.keypress)
    .await(session.actions.logs.preventEnterKey)
    .subscribe();

    Reactive.on(session.events.cmds.narrow.keyup)
       .await(
           Match.on(function() {
               return session.ui.cmds.narrow.$option.is(':checked');
           })
           .value(true, session.actions.logs.filter)
           .default(session.actions.logs.find)
           .action()
        )
    .await(session.actions.logs.preventEnterKey)
    .subscribe();

    Reactive.on(session.events.log)
       .await(
            Match.regex(/^#[\w]*:ts /, session.actions.log.asTimestamp, 'message')
                 .regex(/^#[\w]*:json /, session.actions.log.asJson, 'message')
                 .regex(/^#[\w]*:xml / , session.actions.log.asXml, 'message')
                 .regex(/^#[\w]* /, session.actions.log.asVariable, 'message')
                 .regex(/^\.[\w]* /, session.actions.log.asGroup, 'message')
                 .default(session.actions.log.asInfo)
                 .action()
                 .then(session.actions.log.display)
        )
    .subscribe();

    window.session = session;
});
