/**
 * log
 *
 * @namespace mix.log
 * 
 * @author  Yang,junlong at 2017-05-16 17:39:46 build.
 * @version $Id$
 */

'use strict';

/**
 * Error All Level
 * 
 * E_NOTICE|E_WARNING|E_ERROR|E_DEBUG
 * E_ALL^E_DEBUG
 * 
 * @type {Number}
 */
exports.E_ALL     = 15;

/**
 * Error Normal Level
 * 
 * E_NOTICE|E_WARNING|E_ERROR
 * 
 * @type {Number}
 */
exports.E_NORMAL  = 7;

/**
 * Notice condition
 * 
 * @type {Number}
 */
exports.E_NOTICE  = 1;

/**
 * Warning condition
 * 
 * @type {Number}
 */
exports.E_WARNING = 2;

/**
 * Error condition
 * 
 * @type {Number}
 */
exports.E_ERROR   = 4;

/**
 * Application Internal Debug
 * 
 * @type {Number}
 */
exports.E_DEBUG   = 8;

// Default Error Level
exports.level = exports.E_NORMAL;
exports.throw = false;
exports.alert = false;

/**
 * Log debug `msg`
 * 
 * @param  {String} msg
 * @return {void}
 * @access public
 */
exports.debug = function(msg) {
    log('debug', msg, exports.E_DEBUG);
};

/**
 * Log notice `msg`
 * 
 * @param  {string} msg
 * @return {void} 
 */
exports.notice = function(msg) {
    log('notice', msg, exports.E_NOTICE);
};

/**
 * Log warning `msg`
 * 
 * @param  {string} msg
 * @return {void} 
 */
exports.warning = function(msg) {
    log('warning', msg, exports.E_WARNING);
};

/**
 * Log error `msg`
 * 
 * @param  {string} msg
 * @return {void} 
 */
exports.error = function(err) {
    if(!(err instanceof Error)){
        err = new Error(err.message || err);
    }
    if(exports.alert){
        err.message += '\u0007';
    }
    if(exports.throw){
        throw err;
    } else {
        log('error', err.message);
        process.exit(1);
    }
};

/**
 * Log output message
 * 
 * @param  <String> type
 * @param  <String> msg
 * @param  <Number> level
 * @return <Void>
 */
function log(type, msg, level) {
    level = level || exports.E_NORMAL;
    if((level & exports.level) > 0) {
        type = type.toUpperCase();
        process.stdout.write('\n [' + type + '] ' + msg + '\n');
    }
}
