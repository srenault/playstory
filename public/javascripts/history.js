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

    history.events = {
        log: {
            select: function(next) { history.ui.$logs.find('li').live('click', next); }
        },
        cmds: {
            //rewind: function(next) { history.ui.cmds.$start.click(next); },
            //refresh: function(next) { history.ui.cmds.$stop.click(next); },
            past: function(next) { history.ui.cmds.$past.click(next); }
        }
    };

    history.actions = {
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
            })
        }
    };

    Reactive.on(history.events.cmds.past)
    .await(history.actions.nav.viewPastPage)
    .subscribe();

    (function() {
        console.log('[history.nav] ### watching location hash');
        if(window.location.hash != '') {
            console.log('[history.nav] ### Ok, hash found !');
            var $wantedLog = history.ui.$logs.find('li.log ' + window.location.hash);
                if($wantedLog[0]) {
                    var top = $wantedLog.offset().top - 250;
                    $('html, body').animate({ scrollTop: top}, 'fast');
                }
        }
    })();
});
