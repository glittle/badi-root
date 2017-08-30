'use strict';
// const http = require('http');
// const https = require('https');
const request = require('request');
var compression = require('compression');


//-----
// returns an instance of node-letsencrypt with additional helper methods
var lex = require('letsencrypt-express').create({
    // set to https://acme-v01.api.letsencrypt.org/directory in production
    //server: 'staging'
    server: 'https://acme-v01.api.letsencrypt.org/directory'

    // If you wish to replace the default plugins, you may do so here
    //
    ,
    challenges: {
        'http-01': require('le-challenge-fs').create({
            webrootPath: '/tmp/acme-challenges'
        })
    },
    store: require('le-store-certbot').create({
        webrootPath: '/tmp/acme-challenges'
    }),

    approveDomains: approveDomains
});

function approveDomains(opts, certs, cb) {
    // This is where you check your database and associated
    // email addresses with domains and agreements and such


    // The domains being approved for the first time are listed in opts.domains
    // Certs being renewed are listed in certs.altnames
    if (certs) {
        opts.domains = certs.altnames;
    } else {
        opts.email = 'glen.little@gmail.com';
        opts.agreeTos = true;
    }

    // NOTE: you can also change other options such as `challengeType` and `challenge`
    // opts.challengeType = 'http-01';
    // opts.challenge = require('le-challenge-fs').create({});

    cb(null, {
        options: opts,
        certs: certs
    });
}

var express = require('express');
var app = express();
app.use(compression());

console.log();

var appList = [{
    key: 'fbBot2',
    url: 'http://localhost:8002'
}, {
    key: 'gAction',
    url: 'http://localhost:8001'
}, {
    key: 'yycBus',
    url: 'http://localhost:8005'
        // }, {
        //   key: 'vonic',
        //   url: 'http://localhost:8080'
        // }, {
        // key: 'vue',
        // url: 'http://localhost:8003'
}];

for (let appInfo of appList) {
    console.log(`Setup pass-though: ${appInfo.key} --> ${appInfo.url}`);

    app.all('/' + appInfo.key, function(req, res) {
        console.log(`/${appInfo.key} --> ${appInfo.url} ${req.method}`);

        req.pipe(request({
            url: appInfo.url,
            qs: req.query,
            method: req.method
        }, function(error, response, body) {
            if (error) {
                if (error.code === 'ECONNREFUSED') {
                    console.error('Refused connection');
                } else {
                    console.error(error)
                }
            }
        })).pipe(res);
    });
}



// app.all('/gaction', function (req, res) {
//   let url = 'http://localhost:8001';
//   console.log('gAction' + ` --> ${url} ${req.method}`);

//   req.pipe(request({
//     url: url,
//     qs: req.query,
//     method: req.method
//   }, function (error, response, body) {
//     if (error) {
//       if (error.code === 'ECONNREFUSED') {
//         console.error('Refused connection');
//       } else {
//         console.error(error)
//       }
//     }
//   })).pipe(res);
// });

// app.all('/fbBot2', function (req, res) {
//   let url = 'http://localhost:8002';
//   console.log('fbBot2' + ` --> ${url} ${req.method}`);

//   req.pipe(request({
//     url: url,
//     qs: req.query,
//     method: req.method
//   }, function (error, response, body) {
//     if (error) {
//       if (error.code === 'ECONNREFUSED') {
//         console.error('Refused connection');
//       } else {
//         console.error(error)
//       }
//     }
//   })).pipe(res);
// });


// app.use('/resources', express.static('./resources'))


// app.get('/sw-badi-web3.js', function (req, res) {
//   res.sendFile('c:/users/glen/source/repos/Badi-web3/special/sw-badi-web3.js')
// });

//app.use(express.static('../Badi-Web1'))
// app.use(express.static('../Badi-Web2/dist'))
app.use(express.static('../Badi-Web3-live'))

// app.use(express.static('C:/Users/glen/Source/Projects/badi-chrome-ext'))

app.get('/', function(req, res) {
    res.end('The application is being updated! Please reload in a few seconds...');
});

app.get('/abc', function(req, res) {
    res.end('Hello, ABC 123!');
});

app.use('/images', express.static('../Badi-Images'))
app.use('/scripts', express.static('../scripts'))

// app.get('/app1', function (req, res) {
//   console.log(`Sending app file to ${req.connection.remoteAddress}`);
//   var options = {
//     headers: {
//       'Content-disposition': 'attachment; filename=Wondrous-Badi-App.apk'
//     }
//   };
//   res.sendFile('C:\\Users\\glen\\Source\\Projects\\WondrousBadiMobile\\WondrousBadi\\bin\\Android\\Release\\android-release.apk',
//     options);
// });

app.get('*', function(req, res) {
    res.redirect('/#' + req.url)
});

// // handles acme-challenge and redirects to https
// require('http').createServer(app).listen(80, function () {
//   // console.log("\nListening for ACME http-01 challenges on", this.address());
// });

require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function() {
    // console.log("\nListening for ACME http-01 challenges on", this.address());
});

// handles your app
require('spdy').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function() {
    // console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
    console.log("\nListening on", this.address());
});