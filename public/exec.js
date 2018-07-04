//var socket = io("https://chatchitvn.herokuapp.com/");
/**
 * socket io listening.
 * This area is used to define listening events which are emited from server
 */
var socket = io("http://localhost:50000/");
var currentUser;
socket.on("server-send-reg-fail", function () {
    alert("User name is exist");
});
socket.on("server-send-reg-success", function (data) {  

    viewform("REGISTER_SUCCESS");
    $("#msg").html(data);
});

socket.on("server-send-friend-list", function(data){
    $("#listFriend").html("");
    data.forEach(function(i){
        $("#listFriend").append("<div class='frd'>"
        +"<img class= 'avatar' align='left' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'></img>"
        +"<div class='user'>" + i + "</div>" + "<div id='status'>Offline</div> "+"</div>");    
    }); 
 
});
socket.on("server-send-online-users", function (data) { 
    console.log($(".user").val())   ;
    data.forEach(function (i) {
       $("#listFriend").find('.frd').each(function(){
           var isOnline = false;
           var frd = $(this);
           frd.find('.user').each(function(){    
               var usr = $(this);
             if(usr.text() == i)
             {
                frd.find('#status').each(function(){
                  
                  usr.css('color','#4ccc16');
                  $(this).html("");
                  $(this).append("Online");               
                    
                 });
             }
         });  
       })
    });
});

socket.on("server-send-user-off", function (data) { 
    console.log($(".user").val())   ;
    data.forEach(function (i) {
       $("#listFriend").find('.frd').each(function(){
           var isOnline = false;
           var frd = $(this);
           frd.find('.user').each(function(){    
               var usr = $(this);
             if(usr.text() == i)
             {
                frd.find('#status').each(function(){
                  
                  usr.css('color','#c4ccc1');
                  $(this).html("");
                  $(this).append("Offline");
                 // $(this).css('color','#c4ccc1');
                    
                 });
             }
         });  
       })
    });
});

socket.on("server-send-message", function (data) {
    if(currentUser == data.user){
        $("#listMessage").append("<div class='message'>" + "<img class= 'avatar' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'/></img>"+"<div class='name'>" + data.usr + 
        "</div>" + "<div class='content'>" 
        + data.message + "</div>" + "<div class='creation'>" + data.time +"</div>"+ "</div>");
    }

});

socket.on("user-typing-message", function(data){
    $("#annoucement").append("<div class='message'>" + data.un + " " +  data.content + "</div>");
});

socket.on("user-leave-typing", function(){
    $("#annoucement").html("");
});

socket.on("server-send-login-success", function(data){
    init();
    viewform("LOGIN_SUCCESS");
    $("#displayname").html(data);
    currentUser = data;
});

socket.on("server-send-add-friend-success",function(data){
    init();
    viewform("ADD_FRIEND_SUCCESS");
    var style;
    if(data.status == "Online") {
        style = "style='color: #4ccc16'";
    }
    else{
        style = "style='color: #c4ccc1'";
    }
    var frd = "<div class='frd'><img class= 'avatar' align='left' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'></img>";
    var usr = "<div class ='user'" + style + ">" + data.friend  + "</div>" + "<div id='status'>" + data.status + "</div> "+"</div>";
    var friend = frd + usr;
    $("#listFriend").append(friend);
});

socket.on("server-send-added-friend", function(data){
    init();
    viewform("ADD_FRIEND_SUCCESS");
    var style;
    if(data.status == "Online") {
        style = "style='color: #4ccc16'";
    }
    else{
        style = "style='color: #c4ccc1'";
    }
    var frd = "<div class='frd'><img class= 'avatar' align='left' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'></img>";
    var usr = "<div class ='user'" + style + ">" + data.friend  + "</div>" + "<div id='status'>" + data.status + "</div> "+"</div>";
    var friend = frd + usr;
    $("#listFriend").append(friend);
});

socket.on("server-send-login-fail", function(){
   // $("#ctrl-form").show();
    $("#txtSgFail").show();
});
socket.on("server-send-add-friend", function(data){
    var accerpt = confirm(data.myname + " wants to make friend with you!");
    if(accerpt == true){
        socket.emit("we-are-friend", data);
    }
})

socket.on("server-send-last-session", function(data){
    $("#group-conversation").append(data);
});

/**
 * 
 */
socket.on("server-send-history", function(data){
    $("#listMessage").html("");
    data.forEach(function(rec){
        var dt = new Date(rec.datetime);
        var creation = dt.getDate()+" "+ dt.getMonth() + " "+ dt.getHours() + ":" + dt.getMinutes() +":"+ dt.getSeconds();
        $("#listMessage").append("<div class='message'>" + "<img class= 'avatar' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'/></img>"+"<div class='name'>" + rec.from + 
        "</div>" + "<div class='content'>" 
        + rec.message + "</div>" + "<div class='creation'>" + creation +"</div>"+"</div>");
    })
 
   // $("#listMessage").append(data);
});
socket.on("server-send-pending-friend", function(data){
    init();
    viewform("ADD_FRIEND_SUCCESS");
    var style;  
    style = "style='color: #c4ccc1'";
    var frd = "<div class='frd'><img class= 'avatar' align='left' src='https://avatar.skype.com/v1/avatars/pham.nghiep87?auth_key=-1911296691&returnDefaultImage=false&cacheHeaders=true'></img>";
    var usr = "<div class ='user'" + style + ">" + data.myfriend  + "</div>" + "<div id='status'>pending</div> "+"</div>";
    var friend = frd + usr;
    $("#listFriend").append(friend);
});
/**
 * Common method
 */
function init() {
    
    $("#ctrl-form").hide();
    $("#txtGroup").hide();
    $("#chatForm").hide();
    $("#regForm").hide();
    $("#btnReg").hide();
    $("#btnSignIn").hide();
    $("#btnSignUp").hide();
    $("#btnAdd").hide();
    $("#eml").hide();
    $("#usr").hide();
    $("#pwd").hide();
    $("#txtSgFail").hide(); 
    $(".no-account").hide();
}

function initfield(){
    $(".text-title").html("");
    $("#eml").val("");
    $("#usr").val("");
    $("#pwd").val("");
}

function viewform(view_state)
{
   
    switch(view_state)
    {
        case "LOGIN":
        {
            $("#ctrl-form").show();
            $("#btnSignIn").show();
            $("#usr").show();
            $("#pwd").show();
            $(".no-account").show();
            break;
        }
        case "LOGIN_SUCCESS":
        {
            $("#chatForm").show();
            break;
        }
        case "LOGIN_FAIL":
        {
            $("#ctrl-form").show();
            $("#btnSignIn").show();
            $("#txtSgFail").show();
            break;
        }
        case "REGISTER":
        {
            $("#ctrl-form").show();
            $("#btnReg").show();
            $("#eml").show();
            $("#usr").show();
            $("#pwd").show();
            break;  
        }
        case "ADD_FRIEND":
        {
            $("#ctrl-form").show();
            $("#usr").show();
            $("#btnAdd").show();
            break;
        }
        case "ADD_FRIEND_SUCCESS":
        {
            $("#chatForm").show();
            break;
        }
        case "REGISTER_SUCCESS":
        {
            $("#ctrl-form").hide();
            $("#chatForm").hide();
            $("#txtGroup").show();
            break;
        }
        default:
            init();
        break;
    } 

}
/**
 * Jquery listening events to exec some action
 * 
 */
$(document).ready(function () {
 
  
   init();
   viewform("LOGIN");   
    $("#btnSgOut").click(function () {
        socket.emit("client-send-sign-out");
        $("#ctrl-form").show();
        $("#chatForm").hide();
    });

    $("#msgBox").keyup(function (event) {
        if(event.keyCode == 13)
        {  
            var friend = $("#group-conversation").find(".user").text();

            var msg = {message: $("#msgBox").val(), sendto: friend, time: $.now()  };
            socket.emit("user-send-message", msg);
            $("#msgBox").val("");
        }
    });

    $("#btnSignUp").click(function(){  
        $("#chatForm").hide();   
        $("#btnReg").show();
        $("#btnSignIn").hide();
        $("#btnSignUp").hide();
        $(".email").show();
    });
 
    $("#btnSignIn").click(function(){
        var info ={usr: $("#usr").val(), pwd:$("#pwd").val()}
        socket.emit("client-send-login-request",info);
    });

    $("#btnReg").click(function(){
        var info = {email: $("#eml").val(), usr: $("#usr").val(), pwd:$("#pwd").val()};
        socket.emit("send-register-form", info);
    });

    $(".register").click(function(){
        init();
        initfield();      
        $(".text-title").append("<h4>Create account</h4>");
        viewform("REGISTER");
    });

    $(".add-friend").click(function(){
        init();
        initfield();
        $("#ctrl-form").show();
        $(".text-title").append("<h4>Add new friend</h4>");
        viewform("ADD_FRIEND");
    });
    
    $("#btnAdd").click(function(){
        var document = {myname: $("#displayname").text(), myfriend: $("#usr").val()}
        socket.emit("user-send-add-friend", document);
    })

    $("#txtMessage").focusin(function(){
        socket.emit("user-send-typing-message");
    });
    $("#txtMessage").focusout(function(){
        socket.emit("user-send-leave-typing");
    });

    $("#listFriend").on('click','.frd', function(){
      

        $("#listFriend").each(function(){
            $(this).find('.frd').css('background-color','transparent');
        });

        $(this).css('background-color','#c2efea');      
          
        var user = $(this).find('.user').text();   
        $("#group-conversation").html("");
        $("#group-conversation").append($(this).html());
        $("#listMessage").html("");
       currentUser = user;
        socket.emit("client-send-current-session", user);
    });
});