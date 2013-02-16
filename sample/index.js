'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('../../../../');
var feature_utils = require('../utils/feature_utils');
var grunt = require('grunt');

module.exports = Generator;

function Generator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);

    this.sourceRoot(path.join(__dirname, 'templates'));
    this.appname = path.basename(process.cwd());

    var cb = this.async();
    var self = this;
    this.remote('GVRV', 'generator-blackberry-samples', function (err, remote) {
        if (err) { return cb(err); }

        try {
            this.featuresFile = this.readFileAsString(path.join(remote.cachePath, self.name + '/config.xml'));
            this.indexFile = this.readFileAsString(path.join(remote.cachePath, self.name + '/index.html'));
            this.jsFile = this.readFileAsString(path.join(remote.cachePath, self.name + '/app.js'));
            cb();
        } catch (x) {
            throw {
                name: 'SampleNotFoundException',
                message: 'Cannot find sample: \'' + self.name + '\''
            };
        }
    });
};

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.modifyAppConfig = function modifyAppConfig() {
    if (!this.featuresFile) { return false; }

    var file = 'app/config.xml'; 
    var body = grunt.file.read(file);

    body = feature_utils.rewrite({
        needle: feature_utils.featureHook,
        haystack: body,
        splicable: this.featuresFile.split("\n")
    });

    grunt.file.write(file, body);
};

Generator.prototype.modifyAppIndex = function modifyAppIndex() {
    if (!this.indexFile) { return false; }

    var file = 'app/index.html';
    var body = grunt.file.read(file);

    body = feature_utils.rewrite({
        needle: feature_utils.sampleHTMLHook,
        haystack: body,
        splicable: this.indexFile.split("\n")
    });

    grunt.file.write(file, body);
};

Generator.prototype.modifyAppJS = function modifyAppJS() {
    if (!this.jsFile) { return false; }

    // Assume usage of RequireJS 
    try {
        var file = 'app/scripts/app.js';
        var body = grunt.file.read(file);

        body = feature_utils.rewrite({
            needle: feature_utils.sampleHook,
            haystack: body,
            splicable: this.jsFile.split("\n")
        });

        grunt.file.write(file, body);
    } catch (x) {
        // if they don't use RequireJS, append it to the 
        // end of the html file. 

        var file = 'app/index.html';
        var body = grunt.file.read(file);

        body = feature_utils.rewrite({
            needle: '</body>',
            haystack: body,
            splicable: this.jsFile.split("\n")
        });

        grunt.file.write(file, body);
    }
};