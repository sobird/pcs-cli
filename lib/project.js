/**
 * project
 *
 * @namespace mix.project
 * 
 * @author  Yang,junlong at 2017-05-16 15:18:52 build.
 * @version $Id$
 */

'use strict';

var PRO_ROOT;
var TMP_ROOT;

/**
 * get project to release sources
 * 
 * @return <Object>
 */
exports.source = function() {
    var root = exports.getRoot(),
        source = {},
        project_exclude = /^(\/output\b|\/mix-[^\/]+)$/,
        include = mix.config.get('project.include'),
        exclude = mix.config.get('project.exclude');
    if (mix.util.is(exclude, 'Array')){
        project_exclude = [project_exclude].concat(exclude);
    }else if (exclude){
        project_exclude = [project_exclude, exclude];
    }
    mix.util.find(root, include, project_exclude, root, function(file){
        file = mix.file(file);
        if (file.release) {
            source[file.subpath] = file;
        }
    });
    return source;
};

exports.getPath = function() {

};

/**
 * set project root path
 * 
 * @param <String> path
 */
exports.setRoot = function(path) {
    if(mix.util.isDir(path)){
        PRO_ROOT = mix.util.realpath(path);
    } else {
        mix.log.error('invalid project root path [' + path + ']');
    }
};

/**
 * get project root path
 * 
 * @return <String> path
 */
exports.getRoot = function() {
    if(PRO_ROOT) {
        return getPath(PRO_ROOT, arguments);
    } else {
        mix.log.error('undefined project root');
    }
};

/**
 * set temp root path
 * 
 * @param <String> path
 */
exports.setTemp = function(path) {
    if(mix.util.exists(path)){
        if(!mix.util.isDir(path)){
            mix.log.error('unable to set path[' + path + '] as mix-tmp directory.');
        }
    } else {
        mix.util.mkdir(path);
    }
    TMP_ROOT = mix.util.realpath(path);
    if(TMP_ROOT){
        return TMP_ROOT;
    } else {
        mix.log.error('unable to create dir [' + TMP_ROOT + '] for mix-tmp directory.');
    }
};

/**
 * get temp path
 * 
 * @return <String> 
 */
exports.getTemp = function() {
    if(!TMP_ROOT){
        var list = ['LOCALAPPDATA', 'APPDATA', 'HOME'];
        var name = mix.cli && mix.cli.name ? mix.cli.name : 'mix';
        var tmp;
        for(var i = 0, len = list.length; i < len; i++){
            if(tmp = process.env[list[i]]){
                break;
            }
        }
        tmp = tmp || __dirname + '/../';
        exports.setTemp(tmp + '/.' + name + '-tmp');
    }
    return getPath(TMP_ROOT, arguments);
};

/**
 * get project cache path
 * 
 * @return <String>
 */
exports.getCache = function(){
    return getPath(exports.getTemp('cache'), arguments);
};

function getPath(root, args){
    if(args && args.length > 0){
        args = root + '/' + Array.prototype.join.call(args, '/');
        return mix.util.path(args);
    } else {
        return mix.util.path(root);
    }
}
