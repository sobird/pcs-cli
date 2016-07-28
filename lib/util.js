/**
 * utils
 *
 * @namespace mix.util
 * 
 * @author  Yang,junlong at 2016-07-28 20:27:54 build.
 * @version $Id$
 */

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
