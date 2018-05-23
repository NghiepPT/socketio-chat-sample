var socket = io("http://localhost:50000/")
socket.on("server-send-fail", function (data) {
    alert(data);
});
socket.on("server-send-register-success", function (data) {
    $("#currentUser").html(data);
    $("#loginForm").hide(2000);
    $("#chatForm").show(1000);
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

$(document).ready(function () {

    $("#loginForm").show();
    $("#chatForm").hide();
    $("#btnRegister").click(function () {
        socket.emit("client-send-username", $("#txtUserName").val())
    });

    $("#btnLogout").click(function () {
        socket.emit("client-send-logout");
        $("#loginForm").show();
        $("#chatForm").hide();
    });

    $("#btnSend").click(function () {
        socket.emit("user-send-message", $("#txtMessage").val());
    });

    $("#txtMessage").focusin(function(){
        socket.emit("user-send-typing-message");
    });
    $("#txtMessage").focusout(function(){
        socket.emit("user-send-leave-typing");
    });
});