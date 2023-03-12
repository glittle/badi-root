'use strict';
// const http = require('http');
// const https = require('https');
const request = require('request');
const compression = require('compression');


var greenlock = require('greenlock-express')
    .init({
        packageRoot: __dirname,

        // contact for security and critical bug notices
        maintainerEmail: "glen.little@gmail.com",

        // where to look for configuration
        configDir: './greenlock.d',

        // whether or not to run at cloudscale
        cluster: false
    }); //.ready(httpsWorker);

function httpsWorker (glx) {
    // Get the raw https server:
    var httpsServer = glx.httpsServer(null, function (req, res) {
        res.end("Hello, Encrypted World!");
    });

    httpsServer.listen(443, "10.0.0.4", function () {
        console.info("Listening on ", httpsServer.address());
    });

    // Note:
    // You must ALSO listen on port 80 for ACME HTTP-01 Challenges
    // (the ACME and http->https middleware are loaded by glx.httpServer)
    var httpServer = glx.httpServer();

    httpServer.listen(80, "0.0.0.0", function () {
        console.info("Listening on ", httpServer.address());
    });
}
// Serves on 80 and 443
// Get's SSL certificates magically!
//.serve(app);



var express = require('express');
var app = express();
app.use(compression());
// app.use(express.json());

console.log('-------');
console.log('Root restarted at', new Date().toLocaleString());

var appList = [{
    key: 'fbBot2',
    url: 'http://localhost:8002'
}, {
    key: 'gAction',
    url: 'http://localhost:8001'
}, {
    key: 'gAction2',
    url: 'http://localhost:8004'
}, {
    key: 'gActionV2',
    url: 'http://localhost:8006'
}, {
    key: 'wc-notifier',
    url: 'http://localhost:8003'
}, {
    key: 'yycbus',
    url: 'http://localhost:8005'
}, {
    key: 'yycbusV2',
    url: 'http://localhost:8007'
}, {
    key: 'voiceEmail',
    url: 'http://localhost:8008'
    // }, {
    //     key: 'cmxtrial',
    //     url: 'http://localhost:8006'
    // }, {
    // key: 'vue',
    // url: 'http://localhost:8003'
}];

// var proxy = httpProxy.createProxyServer({});
// proxy.on('error', function (err, req, res) {
//     console.error(`ERROR`, err);
// })

for (let appInfo of appList) {
    console.log(`Setup pass-though: ${appInfo.key} --> ${appInfo.url}`);

    app.all('/' + appInfo.key, function (req, res) {
        console.log(`/${appInfo.key} --> ${appInfo.url} ${req.method}`);

        // proxy.web(req, res, {
        //     target: appInfo.url
        // }, err => {
        //     console.error(`ERROR ${appInfo.key}`, err);
        // });
        // console.log('req.body', req.body);
        var qs = req.query;
        qs.PATH = req.route.path;

        req.pipe(request({
            url: appInfo.url,
            qs: req.query,
            method: req.method
        }, function (error, response, body) {
            if (error) {
                if (error.code === 'ECONNREFUSED') {
                    console.error('Refused connection', error);
                } else {
                    console.error('Error', error)
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

app.get('/', function (req, res) {
    res.end('The application is being updated! Please reload in a few seconds...');
});

app.get('/abc', function (req, res) {
    res.end('Hello, ABC 123!');
});

app.use('/images', express.static('../Badi-Images'))
app.use('/files', express.static('../Badi-Files'))
app.use('/scripts', express.static('../scripts'))
// app.use('/cmxtrial', express.static('C:\\Dev\\codementorx\\trial\\server\\dist', { index: 'index.html' }))

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

app.get('*', function (req, res) {
    res.redirect('/#' + req.url)
});

// // handles acme-challenge and redirects to https
// require('http').createServer(app).listen(80, function () {
//   // console.log("\nListening for ACME http-01 challenges on", this.address());
// });

// require('http').createServer(lex.middleware(require('redirect-https')())).listen(8888,
// require('http').createServer(lex.middleware(app)).listen(8888,
//     '10.0.0.4',
//     function() {
//         console.log("\nListening for ACME http-01 challenges on", this.address());
//     });

// // handles your app
// require('spdy').createServer(lex.httpsOptions, lex.middleware(app))
//     .listen(443,
//         //        'wondrous-badi.today,www.wondrous-badi.today',
//         '10.0.0.4',
//         function() {
//             // console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
//             console.log("\nListening on", this.address());
//         });

greenlock.serve(app);
