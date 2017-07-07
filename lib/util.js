/**
 * utils
 *
 * @namespace mix.util
 * 
 * @author  Yang,junlong at 2016-07-28 20:27:54 build.
 * @version $Id$
 */

var fs = require('fs');
var url = require('url');
var pth = require('path');
var util = require('util');
//var iconv = require('iconv-lite');
var crypto = require('crypto');

var PLATFORM = process.platform;
var ISWIN = PLATFORM.indexOf('win') === 0;

/**
 * text file exts
 * 
 * @type <Array>
 */
var TEXT_FILE_EXTS = [
    'css', 'tpl', 'js', 'php',
    'txt', 'json', 'xml', 'htm',
    'text', 'xhtml', 'html', 'md',
    'conf', 'po', 'config', 'tmpl',
    'coffee', 'less', 'sass', 'jsp',
    'scss', 'manifest', 'bak', 'asp',
    'tmp', 'haml', 'jade', 'aspx',
    'ashx', 'java', 'py', 'c', 'cpp',
    'h', 'cshtml', 'asax', 'master',
    'ascx', 'cs', 'ftl', 'vm', 'ejs',
    'styl', 'jsx', 'handlebars'
];

/**
 * image file exts
 * 
 * @type <Array>
 */
var IMAGE_FILE_EXTS = [
    'svg', 'tif', 'tiff', 'wbmp',
    'png', 'bmp', 'fax', 'gif',
    'ico', 'jfif', 'jpe', 'jpeg',
    'jpg', 'woff', 'cur', 'webp',
    'swf', 'ttf', 'eot', 'woff2'
];

/**
 * mime types
 * 
 * @type <Object>
 */
var MIME_TYPES = {
    //text
    'css':      'text/css',
    'tpl':      'text/html',
    'js':       'text/javascript',
    'jsx':      'text/javascript',
    'php':      'text/html',
    'asp':      'text/html',
    'jsp':      'text/jsp',
    'txt':      'text/plain',
    'json':     'application/json',
    'xml':      'text/xml',
    'htm':      'text/html',
    'text':     'text/plain',
    'md':       'text/plain',
    'xhtml':    'text/html',
    'html':     'text/html',
    'conf':     'text/plain',
    'po':       'text/plain',
    'config':   'text/plain',
    'coffee':   'text/javascript',
    'less':     'text/css',
    'sass':     'text/css',
    'scss':     'text/css',
    'styl':     'text/css',
    'manifest': 'text/cache-manifest',
    
    //image
    'svg':      'image/svg+xml',
    'tif':      'image/tiff',
    'tiff':     'image/tiff',
    'wbmp':     'image/vnd.wap.wbmp',
    'webp':     'image/webp',
    'png':      'image/png',
    'bmp':      'image/bmp',
    'fax':      'image/fax',
    'gif':      'image/gif',
    'ico':      'image/x-icon',
    'jfif':     'image/jpeg',
    'jpg':      'image/jpeg',
    'jpe':      'image/jpeg',
    'jpeg':     'image/jpeg',
    'eot':      'application/vnd.ms-fontobject',
    'woff':     'application/font-woff',
    'woff2':    'application/font-woff',
    'ttf':      'application/octet-stream',
    'cur':      'application/octet-stream'
};

/**
 * 通用唯一识别码 (Universally Unique Identifier)
 * 
 * @return string
 */
exports.uuid = function () {
    var _uuid = [],
    _stra = "0123456789ABCDEF".split('');
    for (var i = 0; i < 36; i++){
        _uuid[i] = Math.floor(Math.random() * 16);
    }
    _uuid[14] = 4;
    _uuid[19] = (_uuid[19] & 3) | 8;
    for (i = 0; i < 36; i++) {
        _uuid[i] = _stra[_uuid[i]];
    }
    _uuid[8] = _uuid[13] = _uuid[18] = _uuid[23] = '-';
    return _uuid.join('');
};

/**
 * md5 crypto
 * 
 * @param  <String> | <Binary> data
 * @param  <Number> len
 * @return <String> 
 */
exports.md5 = function(data, len) {
    var md5sum = crypto.createHash('md5');
    var encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    len = len || mix.config.get('project.md5Length', 7);
    return md5sum.digest('hex').substring(0, len);
};

/**
 * base64 encode
 * 
 * @param  <Buffer | Array | String> data
 * @return <String>
 */
exports.base64 = function(data) {
    if(data instanceof Buffer){
        //do nothing for quickly determining.
    } else if(data instanceof Array){
        data = new Buffer(data);
    } else {
        //convert to string.
        data = new Buffer(String(data || ''));
    }
    return data.toString('base64');
};

exports.map = function(obj, callback, scope) {
    if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (callback.call(scope, obj[i], i, obj) === false) {
                return;
            }
        }
    } else {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (callback.call(scope, obj[key], key, obj) === false) {
                    return;
                }
            }
        }
    }
};

/**
 * camel format
 *
 * @usage
 * aaa-bbb_ccc ddd -> AaaBbbCccDdd
 * 
 * @param  {String} string
 * @return {String}
 */
exports.camelcase = (function(){
    var list = {};
    return function(string){
        var result = '';
        if(string){
            string.split(/[-_ ]+/).forEach(function(ele){
                result += ele[0].toUpperCase() + ele.substring(1);
            });
        } else {
            result = string;
        }
        return list[string] || (list[string] = result);
    }
})();

/**
 * 数据类型判断
 * 
 * @param  <Mixed>   source
 * @param  <String>  type
 * @return <Boolean>
 */
exports.is = function (source, type) {
    type = exports.camelcase(type);
    return toString.call(source) === '[object ' + type + ']';
};

/**
 * print object to terminal
 *
 * @param  <Object> object
 * @param  <String> prefix
 * @return <Void>
 */
exports.print = function (object, prefix) {
    prefix = prefix || '';
    for(var key in object){
        if(object.hasOwnProperty(key)){
            if(typeof object[key] === 'object'){
                arguments.callee(object[key], prefix + key + '.');
            } else {
                console.log(prefix + key + '=' + object[key]);
            }
        }
    }
}

/**
 * hostname & ip address
 * 
 * @return <String>
 */
exports.hostname = function () {
    var net = require('os').networkInterfaces();
    for(var key in net){
        if(net.hasOwnProperty(key)){
            var details = net[key];
            if(details && details.length){
                for(var i = 0, len = details.length; i < len; i++){
                    var ip = String(details[i].address).trim();
                    if(ip && /^\d+(?:\.\d+){3}$/.test(ip) && ip !== '127.0.0.1'){
                        return ip;
                    }
                }
            }
        }
    }

    return '127.0.0.1';
};

/**
 * if text file
 * 
 * @param  <String> file
 * @return <Boolean>
 */
exports.isTxt = function(file) {
    return fileTypeReg('text').test(file || '');
};

/**
 * if image file
 * 
 * @param  <String> file
 * @return <Boolean>
 */
exports.isImg = function(file) {
    return fileTypeReg('image').test(file || '');
};

/**
 * if platform windows
 * 
 * @return <Boolean>
 */
exports.isWin = function() {
    return ISWIN;
}

/**
 * if buffer utf8 charset
 * 
 * @param  <Buffer>  bytes
 * @return <Boolean>
 */
exports.isUtf8 = function(bytes) {
    var i = 0;
    while(i < bytes.length) {
        if((// ASCII
            0x00 <= bytes[i] && bytes[i] <= 0x7F
        )) {
            i += 1;
            continue;
        }
        
        if((// non-overlong 2-byte
            (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
            (0x80 <= bytes[i+1] && bytes[i+1] <= 0xBF)
        )) {
            i += 2;
            continue;
        }
        
        if(
            (// excluding overlongs
                bytes[i] == 0xE0 &&
                (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || (// straight 3-byte
                ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
                bytes[i] == 0xEE ||
                bytes[i] == 0xEF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || (// excluding surrogates
                bytes[i] == 0xED &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            )
        ) {
            i += 3;
            continue;
        }
        
        if(
            (// planes 1-3
                bytes[i] == 0xF0 &&
                (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || (// planes 4-15
                (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || (// plane 16
                bytes[i] == 0xF4 &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            )
        ) {
            i += 4;
            continue;
        }
        return false;
    }
    return true;
};

/**
 * if path is file
 * 
 * @param  <String>  path
 * @return <Boolean> 
 */
exports.isFile = function(path) {
    return exports.exists(path) && fs.statSync(path).isFile();
};

/**
 * if path is dir
 * 
 * @param  <String>  path
 * @return {Boolean} 
 */
exports.isDir = function(path) {
    return exports.exists(path) && fs.statSync(path).isDirectory();
};

/**
 * adapt buffer charset
 * 
 * @param  <Buffer> buffer
 * @return <Buffer> 
 */
exports.buffer = function(buffer) {
    if(exports.isUtf8(buffer)) {
        buffer = buffer.toString('utf8');
        if (buffer.charCodeAt(0) === 0xFEFF) {
            buffer = buffer.substring(1);
        }
    } else {
        buffer = iconv.decode(buffer, 'gbk');
    }
    return buffer;
};

/**
 * reads the entire contents of a file
 *
 * If the encoding option is specified then this function returns a string. 
 * Otherwise it returns a buffer.
 *
 * @param <String> file
 * @param <Boolean> convert
 * @return <String> | <Buffer>
 */
exports.read = function(file, convert) {
    var content = false;
    if(exports.exists(file)) {
        content = fs.readFileSync(file);
        if(convert || exports.isTxt(file)) {
            content = exports.buffer(content);
        }
    }
    return content;
};

/**
 * read file to json
 * 
 * @param  <String> path
 * @return <Object> 
 */
exports.readJSON = (function(){
    var cache = {};
    return function(path) {
        if(cache[path]) {
            return cache[path];
        }
        var json = exports.read(path, true);
        var result = {};
        if(!json) {
            return false;
        }
        try {
            result = JSON.parse(json);
        } catch(e){
            mix.log.error('parse json file[' + path + '] fail, error [' + e.message + ']');
        }
        return (cache[path] = result);
    }
})();

/**
 * Makes directory
 * 
 * @param  <String> path
 * @param  <Integer> mode
 * @return <undefined>
 */
exports.mkdir = function(path, mode) {
    var exists = exports.exists;
    if(exists(path)) {
        return;
    }
    path.split('/').reduce(function(prev, next) {
        if(prev && !exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if(!exists(path)) {
        fs.mkdirSync(path, mode);
    }
};

/**
 * write data to a file, 
 * replacing the file if it already exists. 
 * data can be a string or a buffer
 * 
 * @param  <String> | <Buffer> | <Integer> file
 * @param  <String> | <Buffer> data
 * @param  <Object> | <String> options
 * @param  <Boolean> append
 * @return <undefined>
 */
exports.write = function(file, data, options, append) {
    if(!exports.exists(file)){
        exports.mkdir(exports.pathinfo(file).dirname);
    }
    if(append) {
        fs.appendFileSync(file, data, options);
    } else {
        fs.writeFileSync(file, data, options);
    }
};

/**
 * Gets file modification time
 * 
 * @param  <String> path
 * @return <Timestamp>  
 */
exports.mtime = function(path) {
    var time = 0;
    if(exports.exists(path)){
        time = fs.statSync(path).mtime;
    }
    return time;
};

/**
 * Touch a file
 * 
 * @param  <String> path  
 * @param  <timestamp> mtime 
 * @return <undefined>
 */
exports.touch = function(path, mtime) {
    if(!exports.exists(path)){
        exports.write(path, '');
    }
    if(mtime instanceof Date){
        //do nothing for quickly determining.
    } else if(typeof mtime === 'number') {
        var time = new Date();
        time.setTime(mtime);
        mtime = time;
    } else {
        mix.log.error('invalid argument [mtime]');
    }
    fs.utimesSync(path, mtime, mtime);
};

/**
 * Node.js file system
 * 
 * @type <Object>
 */
exports.fs = fs;

/**
 * Test whether or not the given path exists by checking with the file system. 
 * 
 * @param  <String> | <Buffer> path
 * @return <Boolean> Returns true if the file exists, false otherwise.
 */
exports.exists = fs.existsSync;

/**
 * Only paths that can be converted to UTF8 strings are supported.
 * 
 * @param  {String} path    [description]
 * @param  {Object} options [description]
 * @return <String>|<False> Returns the resolved path.
 */
exports.realpath = function(path, options){
    if(path && exports.exists(path)){
        path = fs.realpathSync(path, options);
        if(ISWIN){
            path = path.replace(/\\/g, '/');
        }
        if(path !== '/'){
            path = path.replace(/\/$/, '');
        }
        return path;
    } else {
        return false;
    }
};

/**
 * Create path by arguments.
 * 
 * @param  <String> | <Array> path
 * @return <String> 
 */
exports.path = function(path) {
    var type = typeof path;
    if(arguments.length > 1) {
        path = Array.prototype.join.call(arguments, '/');
    } else if(type === 'string') {
        // do nothing for quickly determining.
    } else if(type === 'object') {
        // array object
        path = Array.prototype.join.call(path, '/');
    } else if(type === 'undefined') {
        path = '';
    }
    if(path){
        path = pth.normalize(path.replace(/[\/\\]+/g, '/')).replace(/\\/g, '/');
        if(path !== '/'){
            path = path.replace(/\/$/, '');
        }
    }
    return path;
};

/**
 * Only paths that can be converted to UTF8 strings are supported.
 * 
 * @param  {String} path    [description]
 * @param  {Object} options [description]
 * @return <String>|<False> Returns the resolved path.
 */
exports.realpath = function(path, options){
    if(path && exports.exists(path)){
        path = fs.realpathSync(path, options);
        if(ISWIN){
            path = path.replace(/\\/g, '/');
        }
        if(path !== '/'){
            path = path.replace(/\/$/, '');
        }
        return path;
    } else {
        return false;
    }
};

/**
 * Returns an object whose properties represent significant elements of the path
 * 
 * @param  <String> path
 * @return <Object> 
 *
 * The returned object will have the following properties:
 * { 
 *     origin: './test.js?ddd=11',
 *     rest: './test',
 *     hash: '',
 *     query: '?ddd=11',
 *     fullname: './test.js',
 *     dirname: '.',
 *     ext: '.js',
 *     filename: 'test',
 *     basename: 'test.js'
 * }
 */
exports.pathinfo = function(path) {
    /**
     * parse path by url.parse
     * 
     * {
     *     protocol: null,
     *     slashes: null,
     *     auth: null,
     *     host: null,
     *     port: null,
     *     hostname: null,
     *     hash: null,
     *     search: '?dfad=121',
     *     query: 'dfad=121',
     *     pathname: './test.js',
     *     path: './test.js?dfad=121',
     *     href: './test.js?dfad=121'
     * }
     * @type {[type]}
     */
    var urls = url.parse(path);

    /**
     * parse path by path.parse
     * 
     * {
     *     root: '',
     *     dir: '.',
     *     base: 'test.js?dfad=121',
     *     ext: '.js?dfad=121',
     *     name: 'test'
     * }
     * @type <Object>
     */
    var pths = pth.parse(urls.pathname || path);

    // tobe output var
    var origin = urls.path;
    var root = pths.root;
    var hash = urls.hash;
    var query = urls.search;
    var fullname = origin.replace(query, '');
    var dirname = pths.dir || '.';
    var filename = pths.name;
    var basename = (pths.base || '').replace(query, '');
    var rest = dirname + '/' + filename;
    var ext = (pths.ext || '').replace(query, '');

    return {
        'origin': origin,
        'dirname': dirname,
        'fullname': fullname,
        'filename': filename,
        'basename': basename,
        'query': query,
        'rest': rest,
        'hash': hash,
        'root': root,
        'ext': ext
    };
};

/**
 * Returns a parent directory's path
 * 
 * @param  <String> path 
 * @return <String> 
 */
exports.dirname = function(path) {
    return pth.resolve(path, '..');
};

/**
 * file type regular
 * 
 * @param  <String> type
 * @return <Regular>
 */
function fileTypeReg(type) {
    var map = [], ext = mix.config.get('project.fileType.' + type);
    if(type === 'text'){
        map = TEXT_FILE_EXTS;
    } else if(type === 'image'){
        map = IMAGE_FILE_EXTS;
    } else {
        mix.log.error('invalid file type [' + type + ']');
    }
    // custom file type
    if(ext && ext.length){
        if(typeof ext === 'string'){
            ext = ext.split(/\s*,\s*/);
        }
        map = map.concat(ext);
    }
    map = map.join('|');
    return new RegExp('\\.(?:' + map + ')$', 'i');
}