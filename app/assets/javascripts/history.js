var history = {
    init: function() {},
    $matchedLogs: [],
    ui: {},
    events: {}
};

history.init = function(listenURL) {
    this.listenURL = listenURL;
};

$(document).ready(function() {

    history.ui = {
        cmds: {
            $get: $('div#cmds'),
            $past: $('ul.tab #tab_past')
        },
        $logs: $('div#logs_past ul')
    };

    history.observable = {
        logs: new function() {
            var receiveSubscribers = [];
            var displaySubscribers = [];
            this.onReceive = function(f) {
                receiveSubscribers.push(f);
            };
            this.receive = function(logs, callback) {
                receiveSubscribers.forEach(function(cb) {
                    logs.forEach(function(log) {
                        cb(log);
                    });
                });
                this.display();
                callback();
            };
            this.onDisplay = function(f) {
                displaySubscribers.push(f);
            };
            this.display = function() {
                displaySubscribers.forEach(function(cb) {
                    cb();
                });
            };
        },
        nav: {
            url: new function() {
                var subscribers = [];
                this.onHasHash = function(f) {
                    subscribers.push(f);
                };
                this.hash = function(hash) {
                    subscribers.forEach(function(cb) { cb(hash); });
                };
            }
        }
    };

    history.events = {
        logs: {
            display: function(next) { history.observable.logs.onDisplay(next); } 
        },
        log: {
            receive: function(next) { history.observable.logs.onReceive(next); },
            select: function(next) { history.ui.$logs.find('li').live('click', next); }
        },
        cmds: {
            //rewind: function(next) { history.ui.cmds.$start.click(next); },
            //refresh: function(next) { history.ui.cmds.$stop.click(next); },
            past: function(next) { history.ui.cmds.$past.click(next); }
        },
        nav: {
            url: {
                hasHash: function(next) { history.observable.nav.url.onHasHash(next); }
            }
        }
    };

    history.actions = {
        log: new commons.actions.log(history.ui.$logs),
        nav: {
            viewPastPage: Action(function(v, n) {
                if(history.ui.cmds.$past.hasClass('selected')) {
                    history.ui.cmds.$past.removeClass('selected');
                    history.ui.$logs.hide();
                } else {
                    history.ui.cmds.$past.addClass('selected');
                    history.ui.$logs.show();
                }
                n(v);
            }),

            /**
             * Go to a specific log
             */
            go: Action(function(v, n) {
                console.log('[history.actions.nav.go] Going to a specific log');
                var $wantedLog = history.ui.$logs.find(window.location.hash);
                if($wantedLog[0]) {
                    $wantedLog.addClass('selected');
                    var top = $wantedLog.offset().top - 250;
                    $('html, body').animate({ scrollTop: top}, 'fast');
                }
                n(v);
            })
        },
        http: {
            logs: Action(function(v, n) {
                $.ajax({
                    url: history.listenURL + '/last',
                    type: 'GET',
                    success: function(logs) {
                        console.log('[history.actions.http.logs] ### receive history: ' + logs);
                        history.observable.logs.receive(logs, function() {
                            n(v);
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('[history.actions.http.logs] ### Error while loading history');
                        n(v);
                    }
                });
            })
        }
    };

    When(history.events.cmds.past)
    .await(history.actions.nav.viewPastPage)
    .subscribe();

    When(history.events.nav.url.hasHash)
    .await(history.actions.http.logs)
    .subscribe();

    When(history.events.log.receive)
    .await(
         session.actions.log.asInfo.then(
             session.actions.log.display
         )
     )
    .subscribe();

    When(history.events.logs.display)
    .await(history.actions.nav.go)
    .subscribe();

    (function() {
        console.log('[history.nav] ### watching location hash');
        if(window.location.hash != '') {
            console.log('[history.nav] ### Ok, hash found !');
            history.ui.cmds.$past.addClass("selected");
            history.observable.nav.url.hash(window.location.hash);
        }
    })();
});
