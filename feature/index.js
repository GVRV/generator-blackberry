'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('../../../../');
var feature_utils = require('../utils/feature_utils');
var grunt = require('grunt');

module.exports = Generator;

function Generator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    feature_utils.applyOptions.apply(this);

    this.sourceRoot(path.join(__dirname, 'templates'));
    this.appname = path.basename(process.cwd());
};

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.modifyAppConfig = function modifyAppConfig() {
    var file = 'app/config.xml'; 
    var body = grunt.file.read(file);

    var feature = "<feature id=\"blackberry." + this.name + "\" version=\"" + this.options['fversion'] + "\" ";
    if (this.options['required']) {
        feature += "required=\"true\" "
    }
    feature += "/>"

    body = feature_utils.rewrite({
        needle: feature_utils.featureHook,
        haystack: body,
        splicable: [
          feature
        ]
    });

    grunt.file.write(file, body);
};