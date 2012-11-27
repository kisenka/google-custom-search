;(function(__target, __name) {

    var __uid,
        __jsonpProxyFuncName,
        __jsonpProxyFunc,
        __jsonpStorageScriptNodeId,
        GoogleCustomSearch;

    __uid = Math.random().toString().substr(2);
    __jsonpProxyFuncName = '__jsonpProcessProxy' + __uid;
    __jsonpStorageScriptNodeId = '__jsonpStorage' + __uid;

    // create jsonp process proxy func
    __jsonpProxyFunc = window[__jsonpProxyFuncName] = function(data) {
        if (typeof arguments.callee.dataStorage === 'undefined') {
            arguments.callee.dataStorage = {};
        }
        arguments.callee.dataStorage = data;
    };

    // creates script-node for JSONP
    function createScript(url, callback) {
        var scriptNode,
            headNode = document.getElementsByTagName('head')[0],
            prevScriptNode = document.getElementById(__jsonpStorageScriptNodeId);

        if (prevScriptNode !== null) {
            headNode.removeChild(prevScriptNode);
        }

        scriptNode = document.createElement('script');
        scriptNode.id = __jsonpStorageScriptNodeId;
        scriptNode.type = 'text/javascript';
        scriptNode.src = url;

        if (headNode !== null) {
            headNode.appendChild(scriptNode);
        }

        if (callback != null) {
            scriptNode.onreadystagechange = callback;
            scriptNode.onload = callback;
        }
    }

    // object to query string
    function objectToQueryString(object) {
        var fld,
            paramPairStr = '',
            paramsPairs = [];

        for (fld in object) {
            paramPairStr = fld + '=' + encodeURIComponent(object[fld]);
            paramsPairs.push(paramPairStr);
        }

        return paramsPairs.join('&');
    }

    // search class constructor
    GoogleCustomSearch = function(options) {
        var that = this,
            option;

        if (typeof options == 'object') {
            for (option in options) {
                if (option in that) {
                    that[option] = options[option];
                }
            }
        }

        that.init(options);
    };

    // search class prototype
    GoogleCustomSearch.prototype = {

        /* take it from here https://code.google.com/apis/console */
        googleApiKey: null,

        /* http://www.google.com/cse */
        googleCustomSearchId: null,

        currentQuery: null,

        perPage: 10,

        currentPage: 1,

        totalResults: 0,

        isBusy: false,

        results: null,

        hasError: false,

        error: null,

        onProcessResults: null,

        init: function(options) {
            var that = this;
        },

        doSearch: function(query, pageNum) {
            var that = this,
                perPage = that.perPage,
                pageNum = (typeof pageNum !== 'undefined') ? pageNum : that.currentPage,
                start = ((pageNum * perPage) - perPage) + 1,
                searchUrl = 'https://www.googleapis.com/customsearch/v1',
                searchParams = {
                    key: that.googleApiKey,
                    cx: that.googleCustomSearchId,
                    q: encodeURIComponent(query),
                    start: start,
                    num: perPage,
                    callback: __jsonpProxyFuncName
                };

            that.isBusy = true;
            createScript(searchUrl + '?' + objectToQueryString(searchParams), function() {
                that.isBusy = false;
                that.results = __jsonpProxyFunc.dataStorage;

                if ('error' in that.results) {
                    that.hasError = true;
                    that.error = that.results.error;
                }
                else if ('items' in that.results) {
                    that.hasError = false;
                    that.totalResults = that.results.searchInformation.totalResults;
                }

                if (typeof that.onProcessResults === 'function') {
                    that.onProcessResults.call(that, that.results);
                }
            });
        },

        getResults: function() {
            var that = this;
            return that.results;
        }
    };

    __target[__name] = GoogleCustomSearch;

})(window, 'GoogleCustomSearch');