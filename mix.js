/**
 * mix base on fis-kernel
 *
 * @see https://github.com/fex-team/fis-kernel
 *
 * Copyright (c) 2015 sobird
 * Licensed under the MIT license.
 * https://github.com/yangjunlong/mix/blob/master/LICENSE
 *
 * @author  Yang,junlong at 2016-03-02 18:46:39 build.
 * @version $Id$
 */

'use strict';

/**
 * Object.derive OO组合继承
 * 
 * @param  <Function> | <Object> constructor
 * @param  <Object> proto
 * @return <Function> 
 *
 * @example
 * var Foo = Object.derive(function() {
 *     this.name = 'foo';
 *     this.age = 31;
 * }, {
 *     getName: function() {
 *         return this.name;
 *     },
 *     getAge: function() {
 *         return this.age;
 *     }
 * });
 *
 * var foo = new Foo();
 * foo.getName();
 * foo.getAge();
 *
 * var Mix = Foo.derive(fuction() {
 *     this.name = 'mix';
 *     this.age = 21;
 * });
 *
 * var mix = new Mix();
 * mix.getName();
 * mix.getAge();
 */
Function.prototype.derive = function(constructor, proto){
    if(typeof constructor === 'object'){
        proto = constructor;
        constructor = proto.constructor || function(){};
        delete proto.constructor;
    }
    var parent = this;
    var fn = function(){
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function(){};
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for(key in cp){
        if(cp.hasOwnProperty(key)){
            fp[key] = cp[key];
        }
    }
    proto = proto || {};
    for(key in proto){
        if(proto.hasOwnProperty(key)){
            fp[key] = proto[key];
        }
    }
    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;
    return fn;
};

/**
 * Class instantiated factory method
 * 
 * @return <Object> instance
 */
Function.prototype.factory = function(){
    var clazz = this;
    function F(args){
        clazz.apply(this, args);
    }
    F.prototype = clazz.prototype;
    return function(){
        return new F(arguments);
    };
};

var colors = require('colors');

// mix
var mix = module.exports = {};

// register global variable
Object.defineProperty(global, 'mix', {
    enumerable: true,
    writable: false,
    value: mix
});

mix.require = function() {
    var path;
    var args = Array.prototype.slice.call(arguments, 0);
    var last = args[args.length - 1];

    if(last.id) {
        // require() lookup paths
        module.paths = mix.util.extend(module.paths, last.paths);
        args.pop();
    } 

    // unshift local node_modules path
    module.paths.unshift(process.cwd() + '/node_modules');

    // @mi prefix paths
    module.paths.map(function(item, index){
        module.paths.push(item + '/@mi');
    });

    var name = args.join('-');
    if(mix.require._cache.hasOwnProperty(name)) {
        return mix.require._cache[name];
    }
    var names = [];
    for(var i = 0, len = mix.require.prefixes.length; i < len; i++){
        try {
            var pluginName = mix.require.prefixes[i] + '-' + name;
            names.push(pluginName);
            path = require.resolve(pluginName);
            try {
                return mix.require._cache[name] = require(pluginName);
            } catch (e){
                mix.log.notice('load plugin [' + pluginName + '] error : ' + e.message);
                return false;
            }
        } catch (e){
            if (e.code !== 'MODULE_NOT_FOUND') {
                throw e;
            }
        }
        
    }
    //mix.log.notice('unable to load plugin [' + names.join('] or [') + ']');
    return false;
};
mix.require._cache = {};
mix.require.prefixes = ['mix'];

mix.log = require('./lib/log.js');
mix.config = require('./lib/config.js');
mix.util = require('./lib/util.js');
mix.project = require('./lib/project.js');
mix.server = require('./lib/server.js');

// Gets info from package.json
mix.info = mix.util.readJSON(__dirname + '/package.json');
mix.version = mix.info.version;
mix.description = mix.info.description;

mix.commands = ['server'];

// mix-cli run
mix.run = function() {
    /**
     * npm commander package
     *
     * @see https://www.npmjs.com/package/commander
     * @type <commander>
     */
    var program = require('commander');

    program
        .version(mix.version)
        .description(mix.description)
        .usage('[command] [option]')
        .on('--help', function() {
            // todo
            console.log('');
            console.log('For more information, see ' + mix.info.homepage);
        });

    mix.commands.forEach(function(name) {
        var cli = mix.require('command', name);

        cli.option(program
            .command(cli.name)
            .alias(cli.alias)
            .usage(cli.usage)
            .description(cli.desc)
        )
        .action(function(){
            this.on('--help', function() {
                // todo
                console.log('');
            });
                
            cli.command(this);
            //cmd.option(this);

            cli.action.apply(this, arguments);
                
            //this.help();
        });
    });

    program.parse(process.argv);

    if (!program.args.length) {
        program.help();
    }
}
