var express = require("express");
var mongodb = require('mongodb');
var app = express();

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT||50000);

var MongoClient =  mongodb.MongoClient;

var url ='mongodb://PhamNghiep:thaiduonghe123@ds014118.mlab.com:14118/mdb';


var onUsers=[];
io.on("connection", function(socket){

console.log("client is connecting..");

socket.on("send-register-form", function(data){
    console.log("client send register form");
    MongoClient.connect(url, function(err, db){
        if(err){
            throw err;
            db.close();
        }
        else{
           var dbo = db.db("mdb");
           dbo.collection("user").findOne(data, function(err, result){
               if(err) throw err;
               else{
                   if(result)
                   {   
                    socket.emit("server-send-reg-fail");
                   }
                   else
                   {
                    dbo.collection("user").insertOne(data, function(err, res){
                        if(err) throw err;
                        db.close();
                    });
                    socket.emit("server-send-reg-success","You register successfully!");
                   } 
               }
               db.close();
           });

        }
    });  
});
socket.on("client-send-login-request", function(data){
    MongoClient.connect(url,function(err, db){
        if(err) throw err;
        else{
            var dbo = db.db("mdb");
            dbo.collection("user").findOne(data, function(err, result){
                if(err) throw err;
                else{
                    if(result.usr){                     
                        if(onUsers.indexOf(result.usr< 0))
                        {
                            onUsers.push(result.usr);
                            socket.UserName = result.usr;
                        }
                        socket.emit("server-send-login-success",result.usr);
                        io.sockets.emit("server-send-user-online",onUsers);
                    }
                    else{
                        socket.emit("server-send-login-fail");
                    }
                }
            });
        }
    }) ;
});
socket.on("client-send-sign-out", function(){
  console.log(socket.UserName);
  onUsers.splice(onUsers.indexOf(socket.UserName),1);
  socket.broadcast.emit("server-send-user-off",onUsers);
  console.log(onUsers);
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

});

});
app.get("/", function(req, res){
    res.render("homepage");
});
