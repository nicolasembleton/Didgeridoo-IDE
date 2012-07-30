/*
YUI 3.6.0pr2 (build 5316)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add('yql', function(Y) {

    /**
     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).
     * @module yql
     */     
    /**
     * Utility Class used under the hood my the YQL class
     * @class YQLRequest
     * @constructor
     * @param {String} sql The SQL statement to execute
     * @param {Function/Object} callback The callback to execute after the query (Falls through to JSONP).
     * @param {Object} params An object literal of extra parameters to pass along (optional).
     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)
     */
    var YQLRequest = function (sql, callback, params, opts) {
        
        if (!params) {
            params = {};
        }
        params.q = sql;
        //Allow format override.. JSON-P-X
        if (!params.format) {
            params.format = Y.YQLRequest.FORMAT;
        }
        if (!params.env) {
            params.env = Y.YQLRequest.ENV;
        }

        this._context = this;

        if (opts && opts.context) {
            this._context = opts.context;
            delete opts.context;
        }
        
        if (params && params.context) {
            this._context = params.context;
            delete params.context;
        }
        
        this._params = params;
        this._opts = opts;
        this._callback = callback;

    };
    
    YQLRequest.prototype = {
        /**
        * @private
        * @property _jsonp
        * @description Reference to the JSONP instance used to make the queries
        */
        _jsonp: null,
        /**
        * @private
        * @property _opts
        * @description Holder for the opts argument
        */
        _opts: null,
        /**
        * @private
        * @property _callback
        * @description Holder for the callback argument
        */
        _callback: null,
        /**
        * @private
        * @property _success
        * @description Holder for the success callback argument
        */
        _success: null,
        /**
        * @private
        * @property _failure
        * @description Holder for the failure callback argument
        */
        _failure: null,
        /**
        * @private
        * @property _params
        * @description Holder for the params argument
        */
        _params: null,
        /**
        * @private
        * @property _context
        * @description The context to execute the callback in
        */
        _context: null,
        /**
        * @private
        * @method _internal
        * @description Internal Callback Handler
        */
        _internal: function(r) {
            if (this._failure) {
                if (r.error) {
                    this._failure.call(this._context, r.error);
                } else {
                    this._success.apply(this._context, arguments);
                }
            } else {
                this._success.apply(this._context, arguments);
            }
        },
        /**
        * @method send
        * @description The method that executes the YQL Request.
        * @chainable
        * @return {YQLRequest}
        */
        send: function() {
            var qs = [], url = ((this._opts && this._opts.proto) ? this._opts.proto : Y.YQLRequest.PROTO);

            Y.each(this._params, function(v, k) {
                qs.push(k + '=' + encodeURIComponent(v));
            });

            qs = qs.join('&');
            
            url += ((this._opts && this._opts.base) ? this._opts.base : Y.YQLRequest.BASE_URL) + qs;
            
            var o = (!Y.Lang.isFunction(this._callback)) ? this._callback : { on: { success: this._callback } };

            o.on = o.on || {};

            if (o.on.failure) {
                this._failure = o.on.failure;
            }

            if (o.on.success) {
                this._success = o.on.success;
            }

            o.on.success = Y.bind(this._internal, this);

            if (o.allowCache !== false) {
                o.allowCache = true;
            }
            Y.log('URL: ' + url, 'info', 'yql');
            
            if (!this._jsonp) {
                this._jsonp = Y.jsonp(url, o);
            } else {
                this._jsonp.url = url;
                if (o.on && o.on.success) {
                    this._jsonp._config.on.success = o.on.success;
                }
                this._jsonp.send();
            }
            return this;
        }
    };

    /**
    * @static
    * @property FORMAT
    * @description Default format to use: json
    */
    YQLRequest.FORMAT = 'json';
    /**
    * @static
    * @property PROTO
    * @description Default protocol to use: http
    */
    YQLRequest.PROTO = 'http';
    /**
    * @static
    * @property BASE_URL
    * @description The base URL to query: query.yahooapis.com/v1/public/yql?
    */
    YQLRequest.BASE_URL = ':/'+'/query.yahooapis.com/v1/public/yql?';
    /**
    * @static
    * @property ENV
    * @description The environment file to load: http://datatables.org/alltables.env
    */
    YQLRequest.ENV = 'http:/'+'/datatables.org/alltables.env';
    
    Y.YQLRequest = YQLRequest;
	
    /**
     * This class adds a sugar class to allow access to YQL (http://developer.yahoo.com/yql/).
     * @class YQL
     * @constructor
     * @param {String} sql The SQL statement to execute
     * @param {Function} callback The callback to execute after the query (optional).
     * @param {Object} params An object literal of extra parameters to pass along (optional).
     * @param {Object} opts An object literal of configuration options (optional): proto (http|https), base (url)
     */
	Y.YQL = function(sql, callback, params, opts) {
        return new Y.YQLRequest(sql, callback, params, opts).send();
    };



}, '3.6.0pr2' ,{requires:['jsonp', 'jsonp-url']});