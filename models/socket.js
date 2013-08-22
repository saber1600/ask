//socket 通信

module.exports = function(io){
	//存储在线用户列表
	var users = [];
	io.sockets.on('connection',function(socket){
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

		socket.on('disconnect',function(){
		  //若 users 数组中保存了该用户名
		  if(users.indexOf(socket.name) != -1){
		    //从 users 数组中删除该用户名
		    users.splice(users.indexOf(socket.name),1);
		    //向其他所有用户广播该用户下线信息
		    socket.broadcast.emit('offline',{users:users,user:socket.name});
		  }
		});

		socket.on('selfTalk',function(data){
		  var l;
		});
	});
};