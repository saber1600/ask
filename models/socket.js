//socket 通信


module.exports = function(socket){
	var express = require('express')
	  , http = require('http');

	var app = express();
	var server = http.createServer(app);
	var io = require('socket.io').listen(server);
	var users = [];//存储在线用户列表
	socket.on('online',function(data){
      //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
	  socket.name = data.user;
	  //数组中不存在该用户名则插入该用户名
	  if(users.indexOf(data.user) == -1){
	    users.unshift(data.user);
	  }
	  //向所有用户广播该用户上线信息
	  io.sockets.emit('online',{users:users,user:data.user});
    });
};