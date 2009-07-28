/**
* Updater - jQuery plugin for timed ajax calls
*
* Based on PeriodicalUpdater (http://github.com/RobertFischer/JQuery-PeriodicalUpdater/tree/master)
*
* Copyright (c) 2009 by the following:
* * Robert Fischer (http://smokejumperit.com)
* * 360innovate (http://www.360innovate.co.uk)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* Version: 1.0
*/

(function($) {
    $.Updater = function(url, options, callback){
 
        var settings = jQuery.extend(true, {
            url: url, // URL of ajax request
            method: 'get', // method; get or post
            data: '',     // array of values to be passed to the page - e.g. {name: "John", greeting: "hello"}
            type: 'json', // response type - text, xml, json etc
            interval: '3000'
        }, options);
        
        var timerInterval = settings.interval;

        // Construct the settings for $.ajax based on settings
        var ajaxSettings = jQuery.extend(true, {}, settings);

        ajaxSettings.dataType = settings.type;
        ajaxSettings.type = settings.method; // 'type' is used internally for jQuery. Who knew?

        ajaxSettings.success = function(data) {         
            PeriodicalTimer = setTimeout(getdata, timerInterval);
            if(callback) {
                callback(data);
            }
        };
        // Make the first call
        $(function() { getdata(); });
 
        function getdata() { $.ajax(ajaxSettings); }
    };
})(jQuery);
