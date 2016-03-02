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

// mix
var mix = module.exports = {};

// register global variable
Object.defineProperty(global, 'mix', {
    enumerable: true,
    writable: false,
    value: mix
});

mix.require = function() {
	
};