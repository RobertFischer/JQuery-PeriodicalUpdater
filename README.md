A port of Prototype's `Ajax.PeriodicalUpdater` function to jQuery.

Basically, this function polls some remote service at fairly regular internvals,
and (optionally) processes the result via a callback.  The period of calls will
decay as long as the same response keeps coming back from the server (either in
the form of repeated data or in the form of a 304 Not Modified status), which
reduces the load on the server naturally.   The first Ajax call happens as a page
'onReady' handler (ie: the `jQuery(function)` call), so it is safe to put the PeriodicalUpdater call
anywhere on the page.

## Usage:

```javascript
    $.PeriodicalUpdater('/path/to/service', {
        url: url,         // URL of ajax request
        cache: false,     // By default, don't allow caching
        method: 'GET',    // method; get or post
        data: '',         // array of values to be passed to the page - e.g. {name: "John", greeting: "hello"}
        minTimeout: 1000, // starting value for the timeout in milliseconds
        maxTimeout:64000, // maximum length of time between requests
        multiplier: 2,    // if set to 2, timerInterval will double each time the response hasn't changed (up to maxTimeout)
        maxCalls: 0,      // maximum number of calls. 0 = no limit.
        maxCallsCallback: null, // The callback to execute when we reach our max number of calls
        autoStop: 0,      // automatically stop requests after this many returns of the same data. 0 = disabled
        autoStopCallback: null, // The callback to execute when we autoStop
        cookie: false,    // whether (and how) to store a cookie
        runatonce: false, // Whether to fire initially or wait
        verbose: 0        // The level to be logging at: 0 = none; 1 = some; 2 = all
    }, function(remoteData, success, xhr, handle) {
        // Process the new data (only called when there was a change)
				// For a description of "success", see $.ajax documentation
    });

		// You can also do a bound version: identical to above except that the callback function
		// has 'this' assigned to the JQuery object that you call it on.
		$('.myClass').PeriodicalUpdater('/path/to/service', { /* ... */ }, function(/*...*/) {
			// this is $('.myClass')
		});
```

### Data:

The `data` value can be one of three things:

* A scalar, in which case it will be used constantly.
* A JavaScript map/object, in which case it will be turned into key/value pairs by jQuery
* An anonymous function, in which case it will be executed before each AJAX call.  See
  [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) for more information.

### Cookie:

The `cookie` value will store the timeout of the previous PeriodicalUpdater between page loads. It uses the [JQuery-Cookie](https://github.com/carhartl/jquery-cookie) plugin (imported automatically by the script) to store these values. The value for the `cookie` configuration value can be one of three things:

* A scalar, in which case it is treated as the cookie name
* A JavaScript map/object, in which case you can specify the cookie name as the `name` property,  and you can additionally specify any configuration value for the JQuery-Cookie plugin in order to configure the cookie.
* A boolean, which signals to use a cookie if `true`, and not to use a cookie if `false`.

If you don't specify a cookie name, the cookie name defaults to the PeriodicalUpdater's url. *WARNING:* If you use two PeriodicalUpdaters with the same cookie name, they will each overwrite the other's value, resulting in wonky timeout behavior.

### Other Configuration Data:

Any of the other standard [$.ajax configuration options](http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings)
can be passed to the setting map, including the AJAX callbacks. The only exception is the flag that treats modifications as errors.
That is always going to be `true`.

### Function Return Value (Handle):

The function call returns a handle.  You can call `.stop()` on this handle in order to stop
the updating and ignore any subsequent responses.  If the maximum number of calls, `.stop()`, or
the autoStop has been triggered, you can restart the updater using `.restart()` on the handle.
You can also call `.send()` on the handle to force a send of the AJAX request.
This handle is also passed into the callback functions as the fourth argument.

### More Information:

For more info about the motivation for this plugin, including its advantages over the deprecated 360innovate version, see
[the blog post on EnfranchisedMind](http://blog.enfranchisedmind.com/posts/jquery-periodicalupdater/).

See the source file for license terms.
