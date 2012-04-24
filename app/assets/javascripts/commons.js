var commons = {
    actions: {
    }
};

(function() {
    var newLog = function(id, msg, name, pre) {
        var $log = $('<li id="'+id+'" class="log"></li>');
        if(name) $log.append('<span class="name">'+name+'</div>');
        if(pre) msg = '<pre>' + msg + '</pre>';
        $log.append('<span class="value">'+msg+'</div>');
        return $log;
    };

    commons.actions.log = function($ui) {
        var $logs = $ui;
        return {
            asTimestamp: Action(function(log, n) {
                console.log('[commons.actions.log] ### asTimestamp');
                var nameValue = log.message.split('=>');
                var msg = nameValue[1] + ' [' + new Date(parseInt(nameValue[1])).toString() + ']';
                var $log = newLog(log.id, msg, nameValue[0], true).addClass('variable timestamp');
                $logs.prepend($log);
                n(log);
            }),
            asJson: Action(function(log, n) {
                console.log('[commons.actions.log] ### asJson');
                var nameValue = log.message.split('=>');
                var $log = newLog(log.id, nameValue[1], nameValue[0], true).addClass('variable json');
                try {
                    JSON.parse(nameValue[1]);
                    $log.addClass('valid');
                } catch(e) {
                    $log.addClass('invalid');
                }
                $logs.prepend($log);
                n(log);
            }),
            asXml: Action(function(log, n) {
                console.log('[commons.actions.log] ### asXml');
                var nameValue = log.message.split('=>');
                var xml = nameValue[1].replace(/</gm,'&lt;').replace(/>/gm,'&gt;');
                var $log = newLog(log.id, xml, nameValue[0], true).addClass('variable xml');
                try {
                    $.parseXML(nameValue[1].replace(/<\?.*\?>/,''));
                    $log.addClass('valid');
                } catch(e) {
                    $log.addClass('invalid');
                }
                $logs.prepend($log);
                n(log);
            }),
            asGroup: Action(function(log, n) {
                console.log('[commons.actions.log] ### asGroup');
                var nameValue = log.message.split('=>');
                var $group = session.ui.$logs.find('li.log.'+nameValue[0]);
                if($group.length > 0) {
                    $($group[0]).prepend('<span class="value">'+nameValue[1]+'</span>');
                } else $logs.prepend(newLog(log.id, nameValue[1], nameValue[0]).addClass('variable group' + ' ' + nameValue[0].substring(1, nameValue[0].length-1)));
                n(log);
            }),
            asVariable: Action(function(log, n) {
                console.log('[commons.actions.log] ### asVariable');
                var nameValue = log.message.split('=>');
                $logs.prepend(newLog(log.id, nameValue[1], nameValue[0]).addClass('variable'));
                n(log);
            }),
            asInfo: Action(function(log, n) {
                console.log('[commons.actions.log] ### asInfo');
                var $log = newLog(log.id, log.message).addClass('info');
                if(log.level === 'ERROR') $log.addClass('error');
                $logs.prepend($log);
                n(log);
            }),
            display: Action(function(log, n) {
                console.log('[commons.actions.log] ### display');
                var $lastLog = $logs.find('li.log').first();
                $lastLog.data('timestamp', log.date);
                $lastLog.fadeIn(1000);
                n(log);
            })
        };
    };
})();