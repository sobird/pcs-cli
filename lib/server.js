/**
 * server base
 * 
 * @author  Yang,junlong at 2016-03-17 17:28:24 build.
 * @version $Id$
 */

exports = Object.derive({
    start: function() {
        mix.log.error('You must rewrite the method: start()');
    },
    stop: function(callback) {

    },
    setPid: function() {
        if(!pid) {
            return false;
        }
    },
    getPid: function() {

    }
});
