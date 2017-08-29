var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT
var bodyParser = require('body-parser');
var twilio = require('twilio');
//var firebase = require('firebase-admin');
var waitlist = require("./waitlist.js")
var client = twilio('accountSid', 'authToken');
app.use(bodyParser.urlencoded({ extended: true }));
var globaldata = {}
app.get('/', (request, response) => {
    if(request.body.url != null){
        console.log("CRN: "+request.body.crn)
    }
    else{
        response.sendFile(__dirname + '/index.html');
    }
})
app.post('/add', (request, response) =>{
    console.log("IN ADD");
    console.log(request.body);
})
io.sockets.on('connection', function (socket) {
    socket.on('sendCRN',function(data){
        waitlist.runForSchool("VCU", [data]).then(function(info){
            console.log("here");
            console.log(info);
            if(info[1] <= 0){
                socket.emit("noSeats", info[0][data]);
            }
            else{
                socket.emit("getInfo", info[0][data])
            }
        });
    });
});
http.listen(port, function(){
  console.log('listening on: '+port);
})