var express = require("express");
var mongodb = require('mongodb');
var app = express();

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 50000);

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://PhamNghiep:thaiduonghe123@ds014118.mlab.com:14118/mdb';


var onUsers = [];
var OffUsr = [];
io.on("connection", function (socket) {

   // console.log("client is connecting..");

    socket.on("send-register-form", function (data) {
        //console.log("client send register form");
        MongoClient.connect(url, function (err, db) {
            if (err) {
                throw err;
                db.close();
            }
            else {
                var dbo = db.db("mdb");
                dbo.collection("user").findOne(data, function (err, result) {
                    if (err) throw err;
                    else {
                        if (result) {
                            socket.emit("server-send-reg-fail");
                        }
                        else {
                            dbo.collection("user").insertOne(data, function (err, res) {
                                if (err) throw err;
                                db.close();
                            });
                            socket.emit("server-send-reg-success", "You register successfully!");
                        }
                    }
                    db.close();
                });

            }
        });
    });

    socket.on("client-send-login-request", function (data) {
        var friendlist = [];
        MongoClient.connect(url, function (err, db) {
            if (err)
            {
                throw err;
                db.close();
            } 
            else {
                var dbo = db.db("mdb");
                dbo.collection("user").findOne(data, function (err, result) {
                    if (err) throw err;
                    else {
                        if (result) {
                            if (onUsers.indexOf(result.usr) < 0) {
                                onUsers.push(result.usr);
                                socket.UserName = result.usr;
                            }
                            socket.emit("server-send-login-success", result.usr);
                            dbo.collection("MyFriend").find({ myname: result.usr }, { _id: 0, myname: 0, myfriend: 1 }).toArray(function (err, res) {
                                if (err)
                                {
                                    db.close();
                                    throw err;
                                }                                 
                                else {

                                    if(res)
                                    {
                                        res.forEach(function(friend){
                                            friendlist.push(friend.myfriend);
                                        })
                                    }                                   
             
                                    dbo.collection("MyFriend").find({myfriend: result.usr},{ _id: 0, myname:1, myfriend: 1 }).toArray(function(err, res){
                                        if(err){
                                            throw err;                                           
                                        } 
                                        else{    

                                            if (res) {

                                                res.forEach(function(friend){
                                                    friendlist.push(friend.myname);
                                                });
                                              
                                                socket.emit("server-send-friend-list", friendlist);
                                                io.sockets.emit("server-send-online-users", onUsers);

                                                dbo.collection("session").findOne({from: result.usr}, function(err, res){
                                                    if(err)
                                                    {
                                                        throw err;
                                                        
                                                    } 
                                                    if(res){
                                                        socket.emit("server-send-last-session", res.to);   
                                                        sendhistory(socket, res.to, dbo);                                                     
                                                    } else{
                                                        dbo.collection("session").findOne({to: result.usr}, function(err, res){
                                                        if(err) throw err;
                                                        if(res)
                                                        {
                                                            socket.emit("server-send-last-session", res.from);
                                                            sendhistory(socket, res.from, dbo); 
                                                        }                                                       
                                                        });
                                                    }
                                                    
                                                                                                
                                                    
                                                });
                                            }
                                        }

                                    });
                                   
                                }
                            });


                        }
                        else {
                            socket.emit("server-send-login-fail");
                        }
                    }
                });
            }
        });
    });

    socket.on("user-send-add-friend",function(data){
        if(data.myname == null || data.myfriend == null)
        {
            throw "the name is not null";
        }
        MongoClient.connect(url, function(err, db){
            if(err)
            {
                throw err;       
            } 
            else{
                
                var dbo = db.db("mdb");
                dbo.collection("user").findOne({usr: data.myfriend}, function(err, result){
                    //console.log(result);
                    if(err){
                        throw err;                       
                    } 
                    else{
                        if(result)
                        {  
                            var found = false;
                            dbo.collection("MyFriend").find({myname:data.myname},{id:0,myname:1, myfriend:0}).toArray(function(err, res){
                                if(err) throw err;
                                else{
                                    if(res.myname)
                                    found = true;
                                    else{
                                        dbo.collection("MyFriend").find({myfriend: data.myname}, {id:0,myname:1, myfriend:0}).toArray(function(err, res){
                                            if(err) throw err;
                                            else{
                                                if(res.myname) found = true;
                                            }
                                            if(!found)
                                            {
                                                var  isOnline = false;
                                                for(var id in io.sockets.sockets){
                                                    if(id === socket.id)
                                                         continue;
                                                    var _socket = io.sockets.sockets[id];
                                                    //console.log(_socket);
                                                   // console.log(data.myfriend);
                                                    
                                                    if (data.myfriend == _socket.UserName) {                                                        
                                       
                                                        var document ={myname: data.myname, myfriend:data.myfriend, pending:"no"};
                                                        dbo.collection("MyFriend").insertOne(document);
                                                            _socket.emit("server-send-add-friend", data);
                                                      
                                                            isOnline = true;
                                                     break;
                                                    }                  
                                                                                 
                                                    
                                                }           
  
                                                    if(!isOnline){
                                                        var document ={myname: data.myname, myfriend:data.myfriend, pending:"yes"};
                                                        dbo.collection("MyFriend").insertOne(document);
                                                        socket.emit("server-send-pending-friend", data);
                                                    }
                                                    
                                       
                                            }
                                            db.close();
                                       
                                        })
                                    }
                                }
                            });              
                         //db.close();
            
                        }
                        else{
                            socket.emit("server-send-add-friend-fail");
                        }
                    }
                });    
            }
        });
    });

    socket.on("we-are-friend", function(data){
        MongoClient.connect(url, function(err, db){
            if(err) throw err;
            var dbo = db.db("mdb");
        dbo.collection("MyFriend").insertOne(data, function(err, res){
        // console.log(res);
         if(err) {
             throw err;
             db.close();
         }                    
         else {
             var status = "Offline";
            // console.log(onUsers);
            // console.log(data);
             if(onUsers.indexOf(data.myname) >= 0 )
             {
                 status = "Online";
             }
             //console.log(status);
             var document = {friend:data.myname, status: status};
             socket.emit("server-send-added-friend", document);            
       
             for(var id in io.sockets.sockets){
                if(id === socket.id)
                     continue;
                     var _socket = io.sockets.sockets[id];
                if (data.myname === _socket.UserName) {
                    var doc = {friend: data.myfriend, status: "Online"};
                 _socket.emit("server-send-add-friend-success", doc);
                 break;
                }                 
                                             
                
            }
            db.close();
             
         }
     })
    })
    });

    socket.on("user-send-message", function (data) {
        var document = { from: socket.UserName, to:data.sendto, message: data.message, datetime: data.time};
        //save to database
        ///console.log(data);
        var dt = new Date(data.time);
        var creation =  dt.getHours() + ":" + dt.getMinutes();
        var msg = {usr: socket.UserName, message: data.message, time: creation};
        for(var id in io.sockets.sockets){
            var _socket = io.sockets.sockets[id];
            if(_socket.UserName === data.sendto){
                _socket.emit("server-send-message", msg);
            }
        }

       // io.sockets.emit("server-send-message", msg);
        MongoClient.connect(url, function(err, db){
            if(err){
                throw err;
                //db.close();
            } 
            var dbo = db.db("mdb");
            dbo.collection("history").insertOne(document, function(err, res){
                if(err) throw err;
                db.close();
            });
        });
    });

    socket.on("user-send-typing-message", function () {
        console.log("typing message");
        socket.broadcast.emit("user-typing-message", { un: socket.UserName, content: "is typing" });
    });
    socket.on("user-send-leave-typing", function () {
        socket.broadcast.emit("user-leave-typing");
    });

    socket.on("client-send-current-session", function(data){
     MongoClient.connect(url, function(err, db){
         var dbo = db.db("mdb");
         dbo.collection("user").find({name:data}, function(err, res){
             if(err) {
                throw err;
                //db.close();
             }
           
             if(res) 
             {
                 dbo.collection("session").deleteOne({from:socket.UserName});
                 var document  = {from: socket.UserName, to: data};
                 dbo.collection("session").insertOne(document);
                 sendhistory(socket, data,  dbo);
                // db.close();
              
             }
         });

     })
    });

    socket.on("disconnect", function () {
        if (OffUsr.indexOf(socket.UserName) < 0) {
            OffUsr.push(socket.UserName);
        }
        onUsers.splice(onUsers.indexOf(socket.UserName), 1);
        socket.broadcast.emit("server-send-user-off", OffUsr);
    });
    

});
app.get("/", function (req, res) {
    res.render("homepage");
    //res.render("chatpage");
});
function sendhistory(socket, data, dbo){
    dbo.collection("history").find({from:socket.UserName, to:data},{}).toArray( function(err, result){
        if(err){                        
            throw err;                       
        }               
        
        var res = dbo.collection("history").find({from:data, to: socket.UserName},{}).toArray(function(err, res){
           // console.log(res);
            var chatlog;
            if(err) throw(err);
            if(res.length > 0)
             chatlog = result.concat(res);
             else{
                 chatlog = result;
             }
            //console.log(chatlog);
            var history = chatlog.sort(function(a, b){
                return(parseFloat(a.datetime)- parseFloat(b.datetime));
            })                   
            //var creation = new Date(result.creation);
            console.log(history);
            if(history)
           socket.emit("server-send-history", history);        
        });

    });
}
