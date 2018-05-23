var express = require("express");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT||50000);

var UserNames = ["AAA"];
io.on("connection", function(socket){
console.log("client is connecting..");
socket.on("client-send-username", function(data){
  if(UserNames.indexOf(data)>= 0)
  {
    socket.emit("server-send-fail", data + " is exist");
  }
  else
  {
      UserNames.push(data);
      socket.UserName = data;
      socket.emit("server-send-register-success", data);
      io.sockets.emit("server-send-online-users", UserNames)
  }
});

socket.on("client-send-logout", function(){
    UserNames.splice(UserNames.indexOf(socket.UserName), 1);
    console.log(socket.UserName);
    socket.broadcast.emit("server-send-online-users", UserNames)
});

socket.on("user-send-message", function(data){
 io.sockets.emit("server-send-message", socket.UserName + ": " + data);
});

socket.on("user-send-typing-message", function(){
    console.log("typing message");
    socket.broadcast.emit("user-typing-message", {un: socket.UserName, content: "is typing"});
});
socket.on("user-send-leave-typing", function(){
    socket.broadcast.emit("user-leave-typing");
});
socket.on("disconnect", function(){
    UserNames.splice(UserNames.indexOf(socket.UserName), 1);
    console.log(socket.UserName);
    socket.broadcast.emit("server-send-online-users", UserNames)
});

});
app.get("/", function(req, res){
    res.render("homepage");
});
