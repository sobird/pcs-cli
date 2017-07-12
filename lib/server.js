/**
 * server base
 * 
 * @author  Yang,junlong at 2016-03-17 17:28:24 build.
 * @version $Id$
 */

var child_process = require('child_process');
var spawn = child_process.spawn;

module.exports = Object.derive({
    /**
     * start server
     * 
     * @return <undefined> 
     */
    start: function() {
        mix.log.error('You must rewrite the method: start()');
    },
    stop: function(callback) {
        var pid = this.getPid();
        var opt = this.option();

        if(pid) {
            var isWin = mix.util.isWin();

            checkPid(pid, opt, function(exists) {
                if (exists) {
                    if (isWin) {
                        // windows 貌似没有 gracefully 关闭。
                        // 用 process.kill 会遇到进程关不了的情况，没有 exit 事件响应，原因不明！
                        child_process.exec('taskkill /PID ' + pid + ' /T /F');
                    } else {
                        // try to gracefully kill it.
                        process.kill(pid, 'SIGTERM');
                    }

                    // checkout it every half second.
                    (function(done) {
                        var start = Date.now();
                        var timer = setTimeout(function() {
                            var fn = arguments.callee;

                            checkPid(pid, opt, function(exists) {
                                if (exists) {
                                    // 实在关不了，那就野蛮的关了它。
                                    if (Date.now() - start > 5000) {
                                        try {
                                            isWin ?
                                                child_process.exec('taskkill /PID ' + pid + ' /T /F') :
                                                process.kill(pid, 'SIGKILL');
                                        } catch(e) {
                                            // todo nothing
                                        }
                                        clearTimeout(timer);
                                        done();
                                        return;
                                    }
                                    timer = setTimeout(fn, 500);
                                } else {
                                    done();
                                }
                            });
                        }, 20);
                    })(function() {
                        var pidfile = mix.project.getTemp('server/pid');
                        process.stdout.write('shutdown ' + opt['process'] + ' process [' + pid + ']\n');
                        mix.util.fs.unlinkSync(pidfile);
                        callback && callback(opt);
                    })
                } else {
                    callback && callback(opt);
                }
            });
        } else {
            if(callback) {
                callback(opt);
            }
        }
    },
    setPid: function(pid) {
        if(!pid) {
            return false;
        }
        var pidfile = mix.project.getTemp('server/pid');
        return mix.util.write(pidfile, pid);
    },
    getPid: function() {
        var pidfile = mix.project.getTemp('server/pid');
        if (mix.util.exists(pidfile)) {
            return mix.util.read(pidfile, 'utf8').trim();
        } else {
            return false;
        }
    },
    option: function(options) {
        var conffile = mix.project.getTemp('server/conf.json');
        if(options){
            mix.util.write(conffile, JSON.stringify(options));
        } else if(mix.util.exists(conffile)){
            options = mix.util.readJSON(conffile);
        } else {
            options = {};
        }
        return options;
    },
    info: function() {
        var option = this.option();
        if(option){
            mix.util.print(option, '  ');
        } else {
            // nothing todo
        }
    },
    root: function() {
        var options = this.option();
        return options['root'] || mix.project.getTemp('www');
    },

    checkJavaEnable: function(opt, callback) {
        var javaVersion = false;
        var that = this;
        //check java
        process.stdout.write('checking java support : ');
        var java = spawn('java', ['-version']);

        java.stderr.on('data', function(data){
            if(!javaVersion){
                javaVersion = mix.util.matchVersion(data.toString('utf8'));
                if(javaVersion) {
                    process.stdout.write('v' + javaVersion + '\n');
                }
            }
        });

        java.on('error', function(err){
            process.stdout.write('java not support!');
            mix.log.warning(err);
            callback(javaVersion, opt);
        });

        java.on('exit', function() {
            if (!javaVersion) {
                process.stdout.write('java not support!');
            } else {
                that.option(opt); // rewrite opt
            }
            callback(javaVersion, opt);
        });
    },
    checkPHPEnable: function (options, callback) {
        var check = function(data){
            if(!phpVersion){
                phpVersion = mix.util.matchVersion(data.toString('utf8'));
                if(phpVersion){
                    process.stdout.write('v' + phpVersion + '\n');
                }
            }
        };
        // check php-cgi
        process.stdout.write('checking php-cgi support : ');
        var php = spawn('php', ['--version']);
        var phpVersion = false;
        php.stdout.on('data', check);
        php.stderr.on('data', check);
        php.on('error', function(){
            process.stdout.write('unsupported php-cgi environment\n');
            // mix.log.notice('launching java server.');
            delete options.php_exec;
            callback && callback(phpVersion, options);
        });
        php.on('exit', function() {
            callback && callback(phpVersion, options);
        });
    },
    open: function(callback) {
        var conf = this.option();
        if(mix.util.isDir(conf.root)){
            mix.util.open(conf.root, callback);
        }
    }
});

// private functions
// check server process exists
function checkPid(pid, opt, callback) {
    var list;
    var msg = '';
    var isWin = mix.util.isWin();

    if (isWin) {
        list = spawn('tasklist');
    } else {
        list = spawn('ps', ['-A']);
    }

    list.stdout.on('data', function (chunk) {
        msg += chunk.toString('utf-8').toLowerCase();
    });

    list.on('exit', function() {
        var found = false;
        msg.split(/[\r\n]+/).forEach(function(item){
            var reg = new RegExp('\\b'+opt['process']+'(?:js)?\\b', 'i');
            if (reg.test(item)) {
                var iMatch = item.match(/\d+/);
                if (iMatch && iMatch[0] == pid) {
                    found = true;
                }
            }
        });

        callback(found);
    });

    list.on('error', function (e) {
        if (isWin) {
            mix.log.error('fail to execute `tasklist` command, please add your system path (eg: C:\\Windows\\system32, you should replace `C` with your system disk) in %PATH%');
        } else {
            mix.log.error('fail to execute `ps` command.');
        }
    });
}
