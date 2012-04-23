$(document).ready(function() {

    /**
     * We can subscribe on even of another module.
     */
    var onRouteChange = function(next) { 
        window.addEventListener('hashchange', next);
    };

    /**
     * An action can be shared.
     */
    var sayWelcome = Action(function(v, n) { 
        console.log('Welcome'); 
        n(v); 
    });

    var sayBye = Action(function(v, n) { 
        console.log('Bye'); 
        n(v); 
    });


    /**
     * A Matcher can be global or specialized.
     */
    var customerRoute = Match.value('customers', sayWelcome)
                             .dft(sayBye);

    /**
     * Group processes in the same place.
     */
    When(onRouteChange)
        .map(function(evt) {
            console.log(evt);
            return 'customes';
        })
        .match(customerRoute)
        .subscribe();
});

