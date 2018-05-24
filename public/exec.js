var socket = io("https://chatchitvn.herokuapp.com/")
//var socket = io("http://localhost:50000/");
socket.on("server-send-reg-fail", function () {
    alert("User name is exist");
});
socket.on("server-send-reg-success", function (data) {   
    $("#loginForm").hide();
    $("#chatForm").hide();
    $("#txtGroup").show();
    $("#msg").html(data);
});

socket.on("server-send-online-users", function (data) {
    $("#boxtContent").html("");
    data.forEach(function (i) {
        $("#boxtContent").append("<div class='user'>" + i + "</div>");
    });
});

socket.on("server-send-message", function (data) {
    $("#listMessage").append("<div class='message'>" + data + "</div>");
});

socket.on("user-typing-message", function(data){
    $("#annoucement").append("<div class='message'>" + data.un + " " +  data.content + "</div>");
});

socket.on("user-leave-typing", function(){
    $("#annoucement").html("");
});

socket.on("server-send-login-success", function(data){
    $("#loginForm").hide();
    $("#chatForm").show();
    $("#currentUser").html(data);
});
socket.on("server-send-user-online",function(data){
    $("#boxtContent").html("");
    data.forEach(function (i) {
        $("#boxtContent").append("<div class='user'>" + i + "</div>");
    });
});
socket.on("server-send-login-fail", function(){
   // $("#loginForm").show();
    $("#txtSgFail").show();
});
socket.on("server-send-user-off", function(data){
    $("#boxtContent").html("");
    data.forEach(function (i) {
        $("#boxtContent").append("<div class='user'>" + i + "</div>");
    });
});
function init() {
    $("#txtGroup").hide();
    $("#chatForm").hide();
    $("#regForm").hide();
    $("#btnReg").hide();
    $("#eml").hide();
    $("#txtSgFail").hide();
}
$(document).ready(function () {

   // $("#loginForm").show();
  
   init();

    $("#btnSgOut").click(function () {
        socket.emit("client-send-sign-out");
        $("#loginForm").show();
        $("#chatForm").hide();
    });

    $("#btnSend").click(function () {
        socket.emit("user-send-message", $("#txtMessage").val());
        $("#txtMessage").val("");
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
        var info = {email: $("#eml").val(), usr: $("#usr").val(), pwd:$("#pwd").val()}
        socket.emit("send-register-form", info);
    });

    $("#txtMessage").focusin(function(){
        socket.emit("user-send-typing-message");
    });
    $("#txtMessage").focusout(function(){
        socket.emit("user-send-leave-typing");
    });


});