#!/usr/bin/env node

/* Libraries */
var fs = require("fs");
var path = require("path");
var justtest = require("justtest");

/* Regexes */
var testFileRe = /^test.*\.js$/i

// recursively check files / directories for test files
var checkFile = function(checkPath) {
    var paths = [];
    var stat = fs.statSync(checkPath);
    if (stat.isDirectory()) {
        var subPaths = fs.readdirSync(checkPath);
        for (var p=0; p<subPaths.length; p++) {
            var subPath = subPaths[p];
            paths = paths.concat(checkFile(path.join(checkPath, subPath)));
        }
    } else if (path.basename(checkPath).match(testFileRe)) {
        paths.push(checkPath);
    }
    return paths;
}

var argPaths = [];
var args = process.argv;

if (args.length < 3) {
    // must pass in one or more paths
    console.log("One or more paths required.");
    process.exit(1);
}

// parse arguments for paths
for (var i=2; i<args.length; i++) {
    var argPath = args[i];
    argPaths = argPaths.concat(checkFile(argPath));
}

var report = justtest.TestReport(argPaths.length);

try {
    require.paths.push(process.cwd())
} catch (error) {
    /* Node JS .5 hack "fix" (what is the recommended way?) */
    require.main.paths.push(process.cwd())
}
// run tests on "discovered" test files
argPaths.forEach(function(path) {
    justtest.runTest(path, report);
});

var checkDone = function() {
    if (!report.isFinished()) {
        return process.nextTick(checkDone);
    }
    // summary table
    report.generateReport();
    if (report.hasFailed()) {
        process.exit(1);
    }
};

checkDone();
