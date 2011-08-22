var domTest = require("justtest").domTestCase;

module.exports = domTest("advanced", {

    html: "<html><head></head><body>"+
        "<div><a id='test'>TESTING</a></div></body></html>",

    scripts: ["../jquery.js"],
    exportGlobals: ["jQuery"],

    testTrue: function(test) {
        test.ok(true);
        test.done();
    },
    testError: function(test) {
        /* test a general error. */
        test.doesNotExist();
        test.done();
    },
    testBadFalse: function(test) {
        test.ok(!true);
        test.done();
    },
    testTimeout: function(test) {
        setTimeout(test.wrap(function() {
            test.ok(false);
            test.done();
        }), 1000);
    },
    testHTML: function(test) {
        var $ = test.globals.jQuery;
        var a = $("#test").text();
        test.equal("TESTING", a);
        test.done();
    },

});
