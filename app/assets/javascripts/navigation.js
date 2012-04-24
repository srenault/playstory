var navigation = {
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
    };

    Reactive.on(session.events.cmds.tabs.past)
    .await(session.actions.tabs.viewPast)
    .subscribe();
});
