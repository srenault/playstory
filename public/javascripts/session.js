var session = {
    init: function() {},
    $matchedLogs: [],
    ui: {},
    observable: {},
    events: {}
};

session.init = function(listenURL) {
    this.listenURL = listenURL + '/listen';
};

$(document).ready(function() {
    session.ui = {
        cmds: {
            $get: $('div#cmds'),
            $start: $('div#cmds #stopped #start'),
            $stop: $('div#cmds #started #stop'),
            $clear: $('div#cmds #started #clear'),
            narrow: {
                $get: $('div#cmds #narrow input[type="text"]'),
                $option: $('div#cmds #narrow input[type="checkbox"]')
            },
            $live: $('ul.tab #tab_live')
        },
        $logs: $('div#logs_live ul'),
        $stream: $('iframe#stream')
    };

    session.observable = {
        log: new function() {
            var subscribers = [];
            this.onReceive = function(f) {
                subscribers.push(f);
            };
            this.receive = function(log) {
                if(EventSource) log = JSON.parse(log.data);
                subscribers.forEach(function(cb) { cb(log); });
            };
        }
    };

    session.events = {
        log: {
            receive: function(next) { session.observable.log.onReceive(next); },
            select: function(next) { session.ui.$logs.find('li').live('click', next); }
        },
        cmds: {
            start: function(next) { session.ui.cmds.$start.click(next); },
            stop: function(next) { session.ui.cmds.$stop.click(next); },
            clear: function(next) { session.ui.cmds.$clear.click(next); },
            narrow: {
                keypress: function(next) { session.ui.cmds.narrow.$get.keypress(next); },
                keyup: function(next) { session.ui.cmds.narrow.$get.keyup(next); }
            },
            live: function(next) { session.ui.cmds.$live.click(next); }
        }
    };

    session.actions = {
        log: new commons.actions.log(session.ui.$logs),
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
                var url = session.listenURL;
                if(EventSource) {
                    var source = new EventSource(url);
                    source.onmessage = session.observable.log.receive;
                } else {
                    session.ui.$stream.attr('src', url);
                }
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
        },
        nav: {
            updateHash: Action(function(v, n) {
                window.location.hash = $(v.currentTarget).attr('id');
                n(v);
            }),
            viewLivePage: Action(function(v, n) {
                if(session.ui.cmds.$live.hasClass('selected')) {
                    session.ui.cmds.$live.removeClass('selected');
                    session.ui.$logs.hide();
                } else {
                    session.ui.cmds.$live.addClass('selected');
                    session.ui.$logs.show();
                }
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
        .match(
            Match.on(function() {
                return session.ui.cmds.narrow.$option.is(':checked');
            })
            .value(true, session.actions.logs.filter)
            .def(session.actions.logs.find)
        )
//    .await(session.actions.logs.preventEnterKey)
    .subscribe();

    Reactive.on(session.events.log.receive)
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

    Reactive.on(session.events.log.select)
    .await(session.actions.nav.updateHash)
    .subscribe();

    Reactive.on(session.events.cmds.live)
    .await(session.actions.nav.viewLivePage)
    .subscribe();
});
