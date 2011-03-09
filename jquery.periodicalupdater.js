/**
 * PeriodicalUpdater - jQuery plugin for timed, decaying ajax calls
 *
 * http://www.360innovate.co.uk/blog/2009/03/periodicalupdater-for-jquery/
 * http://enfranchisedmind.com/blog/posts/jquery-periodicalupdater-ajax-polling/
 *
 * Copyright (c) 2009 by the following: Frank White (http://customcode.info)
 * Robert Fischer (http://smokejumperit.com) 360innovate
 * (http://www.360innovate.co.uk)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
(function($) {
  var pu_log = function(msg) {
    try {
      console.log(msg);
    } catch (err) {
    }
  };

  // Now back to our regularly scheduled work
  $.PeriodicalUpdater = function(url, options, callback, autoStopCallback) {
    var settings = {
      url : url,
      cache : false,
      method : 'GET',
      data : '',
      minTimeout : 1000,
      maxTimeout : 8000,
      multiplier : 2,
      maxCalls : 0,
      autoStop : 0,
      boostPeriod : null
    };

    // set some initial values, then begin
    var timer = null;
    var timerInterval = settings.minTimeout;
    var maxCalls = settings.maxCalls;
    var autoStop = settings.autoStop;
    var calls = 0;
    var noChange = 0;
    var originalMaxCalls = maxCalls;

    if (options) {
      $.extend(settings, options);
    }

    var reset_timer = function(interval) {
      if (typeof interval !== 'number') {
        pu_log("interval is not a number");
        handle.stop();
        return;
      }
      if (interval <= 0) {
        pu_log("interval is less or equal to zero");
        handle.stop();
        return;
      }

      if (timer !== null) {
        clearTimeout(timer);
      }
      timerInterval = interval;
      pu_log('resetting timer to ' + timerInterval + '.');
      timer = setTimeout(getdata, timerInterval);
    };

    var boostPeriod = function(oldTimerInterval) {
      if (settings.multiplier >= 1) {
        before = oldTimerInterval;
        timerInterval = oldTimerInterval * settings.multiplier;

        if (timerInterval > settings.maxTimeout) {
          timerInterval = settings.maxTimeout;
        }
        after = timerInterval;
        pu_log('adjusting timer from ' + this.before + ' to '
            + this.after + '.');
        return timerInterval;
      }
    }

    // Construct the settings for $.ajax based on settings
    var ajaxSettings = jQuery.extend(true, {}, settings);
    if (settings.type && !ajaxSettings.dataType) {
      ajaxSettings.dataType = settings.type;
    }
    if (settings.sendData) {
      ajaxSettings.data = settings.sendData;
    }
    ajaxSettings.type = settings.method; // 'type' is used internally for
    // jQuery. Who knew?
    ajaxSettings.ifModified = true;

    var handle = {
      restart : function() {
        maxCalls = originalMaxCalls;
        calls = 0;
        reset_timer(timerInterval);
        return;
      },
      stop : function() {
        pu_log('handle.stop()');
        maxCalls = -1;
        return;
      }
    };

    // Create the function to get data
    // TODO It'd be nice to do the options.data check once (a la
    // boostPeriod)
    function getdata() {
      var toSend = jQuery.extend(true, {}, ajaxSettings); // jQuery screws
      // with what you
      // pass in
      if (typeof (options.data) == 'function') {
        toSend.data = options.data();
        if (toSend.data) {
          // Handle transformations (only strings and objects are
          // understood)
          if (typeof (toSend.data) == "number") {
            toSend.data = toSend.data.toString();
          }
        }
      }

      if (maxCalls == 0) {
        $.ajax(toSend);
      } else if (maxCalls > 0 && calls < maxCalls) {
        $.ajax(toSend);
        calls++;
      }
    }

    // Implement the tricky behind logic
    var remoteData = null;
    var prevData = null;

    ajaxSettings.success = function(data) {
      pu_log("Successful run! (In 'success')");
      remoteData = data;
      // timerInterval = settings.minTimeout;
    };

    ajaxSettings.complete = function(xhr, success) {
      // pu_log("Status of call: " + success + " (In 'complete')");
      if (maxCalls == -1)
        return;
      if (success == "success" /* || success == "notmodified" */) {
        var rawData = $.trim(xhr.responseText);
        if (rawData == 'STOP_AJAX_CALLS') {
          handle.stop();
          return;
        }
        if (prevData == rawData) {
          if (autoStop > 0) {
            noChange++;
            if (noChange == autoStop) {
              handle.stop();
              if (autoStopCallback)
                autoStopCallback(noChange);
              return;
            }
          }
          if (settings.boostPeriod) {
            reset_timer(settings.boostPeriod.call(this,
                timerInterval));
          } else {
            reset_timer(boostPeriod(timerInterval));
          }
        } else {
          noChange = 0;
          reset_timer(settings.minTimeout);
          prevData = rawData;
          if (remoteData == null)
            remoteData = rawData;
          // jQuery 1.4+ $.ajax() automatically converts "data" into a
          // JS Object for "type:json" requests now
          // For compatibility with 1.4+ and pre1.4 jQuery only try to
          // parse actual strings, skip when remoteData is already an
          // Object
          if ((ajaxSettings.dataType === 'json')
              && (typeof (remoteData) === 'string')) {
            remoteData = JSON.parse(remoteData);
          }
          if (settings.success) {
            settings.success(remoteData, success, xhr, handle);
          }
          if (callback)
            callback(remoteData, success, xhr, handle);
        }
      }
      remoteData = null;
    }

    ajaxSettings.error = function(xhr, textStatus) {
      // pu_log("Error message: " + textStatus + " (In 'error')");
      if (textStatus == "notmodified") {
        if (settings.boostPeriod) {
          reset_timer(settings.boostPeriod.call(this, timerInterval));
        } else {
          reset_timer(boostPeriod(timerInterval));
        }
      } else {
        prevData = null;
        reset_timer(settings.minTimeout);
      }
      if (settings.error) {
        settings.error(xhr, textStatus);
      }
    };

    // Make the first call
    $(function() {
      reset_timer(timerInterval);
    });

    return handle;
  };
})(jQuery);
