/**
 * config
 *
 * @namespace mix.config
 * 
 * @author  Yang,junlong at 2017-05-16 15:33:20 build.
 * @version $Id$
 */

var conf = {
    // defaults conf
};

exports.set = function(path, value) {
    if(typeof value == 'undefined') {
        conf = path;
    } else {
        path = String(path || '').trim();
        if(path){
            var paths = path.split('.');
            var last = paths.pop();
            var data = conf;
            paths.forEach(function(key) {
                var type = typeof data[key];
                if(type === 'object') {
                    data = data[key];
                } else if(type === 'undefined') {
                    data = data[key] = {};
                } else {
                    mix.log.error('forbidden to set property[' + key + '] of [' + type + '] data');
                }
            });
            data[last] = value;
        }
    }
    return this;
};

exports.get = function(path, value) {
    var result = conf;
    (path || '').split('.').forEach(function(key) {
        if(key && (typeof result !== 'undefined')) {
            result = result[key];
        }
    });
    if(typeof result === 'undefined') {
        return value;
    } else {
        return result;
    }
};

exports.merge = function() {
    [].slice.call(arguments).forEach(function(arg) {
        if(typeof arg === 'object') {
            (function(source, target) {
                var args = arguments;
                if(typeof source === 'object' && typeof target === 'object') {
                    for(var key in target) {
                        if(target.hasOwnProperty(key)) {
                            source[key] = args.callee(source[key], target[key]);
                        }
                    }
                } else {
                    source = target;
                }
                return source;
            })(conf, arg)
        } else {
            mix.log.warning('unable to merge data[' + arg + '].');
        }
    });
};
