A port of Prototype's `Ajax.PeriodicalUpdater` function to jQuery.

Basically, this function polls some remote service at fairly regular internvals,
and (optionally) processes the result via a callback.  The period of calls will
decay as long as the same response keeps coming back from the server (either in
the form of repeated data or in the form of a 304 Not Modified status), which
reduces the load on the server naturally.   The first Ajax call happens as a page
'onReady' handler (ie: the `jQuery(function)` call), so it is safe to put the PeriodicalUpdater call
anywhere on the page.

Usage:

    $.PeriodicalUpdater('/path/to/service', {
        method: 'get',          // method; get or post
        data: '',               // array of values to be passed to the page - e.g. {name: "John", greeting: "hello"}
        minTimeout: 1000,       // starting value for the timeout in milliseconds
        maxTimeout: 8000,       // maximum length of time between requests
        multiplier: 2,          // the amount to expand the timeout by if the response hasn't changed (up to maxTimeout)
        type: 'text',           // response type - text, xml, json, etc.  See $.ajax config options
        maxCalls: 0,            // maximum number of calls. 0 = no limit.
        autoStop: 0,            // automatically stop requests after this many returns of the same data. 0 = disabled.
        verbose: 0              // Sets the console logging verbosity: 0=none, 1=some, 2=all 
    }, function(remoteData, success, xhr, handle) {
        // Process the new data (only called when there was a change)
    });

The "data" value can be one of three things:

* A scalar, in which case it will be used constantly.
* A JSON map/object, in which case it will be turned into key/value pairs by jQuery
* An anonymous function, in which case it will be executed before each AJAX call.  See 
[jQuery.ajax](http://api.jquery.com/jQuery.ajax/) for more information.

Any of the other standard $.ajax configuration options can be passed to the setting map.  
The only exception is the flag that treats modifications as errors. That’s always
going to be 'true'.

The function call returns a handle.  You can call `.stop()` on this handle in order to stop
the updating and ignore any subsequent responses.  If the maximum number of calls, `.stop()`, or 
the autoStop has been triggered, you can restart the updater using `.restart()` on the handle.
This handle is also passed into the callback function as the fourth argument.

More info, including advantages over 360innovate version, see 
[the blog post on EnfranchisedMind](http://enfranchisedmind.com/blog/posts/jquery-periodicalupdater/).

See the source file for license terms.
