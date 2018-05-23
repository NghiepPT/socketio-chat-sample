var express = require("express");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(50000);

app.get("/", function(req, res){
    res.render("homepage");
});


io.on('connection', function(socket){
    console.log("session "  + socket.id + " is connecting to server");
    socket.on("disconnect", function(){
        console.log(socket.id + "is disconnected");
    })
    socket.on("client-send-data", function(data){
        console.log(socket.id + " send " + data);
        //io.sockets.emit("server-send-data", "Server " + data );
       // socket.emit("server-send-data", "Server" + data);
       socket.broadcast.emit("server-send-data", socket.id + " " + data);
       socket.to(socket.id).emit("server-send-data", "Server " + data);
    })
});
