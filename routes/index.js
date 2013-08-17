var crypto = require('crypto');
var User = require('../models/user.js');

module.exports = function(app){
	app.get('/',function(req,res){
		if(!req.session.user){
		    res.render('index', { 
		    	title:"知道",
		    	name:"问答平台",
		    	user:req.session.user,
		    	error: req.flash('error').toString(),
		    	success: req.flash('success').toString()
		    });
		}else{
			res.redirect('/show');
		}

	});

	app.get('/loginout',function(req,res){
		req.session.user = null;
	    req.flash('success','登出成功!');
	    res.redirect('/');
	});

	app.post('/login',function(req,res){
	    var md5 = crypto.createHash('md5'),
	      password = md5.update(req.body.password).digest('hex');
	    var newUser = new User({
	      name: req.body.name,
	      password: password
	  	});
	  	User.get(newUser.name, function(err, user){
	  		if(user){
	  			if(user.password != password){
	  				req.flash('error','密码不正确');
	  				res.redirect('/');
	  			}else{
	  				req.session.user = user;
	  				res.redirect('/show');
	  			}
	  		}else{
	  			req.flash('error','用户不存在');
	  			res.redirect('/');
	  		}
	  	});

	});
	app.post('/reg',function(req,res){
	    var name = req.body.name,
	      password = req.body.password,
	      password_re = req.body['repassword'];
	    if(password_re != password){
		    req.flash('error','两次输入的密码不一致!'); 
		    return res.redirect('/');
		}
		var md5 = crypto.createHash('md5'),
	      password = md5.update(req.body.password).digest('hex');
	    var newUser = new User({
	      name: req.body.name,
	      password: password
	  	});
	  	User.get(newUser.name, function(err, user){
	  		if(user){
		      err = '用户已存在!';
		    }
		    if(err){
		      req.flash('error', err);
		      return res.redirect('/');
		    }
		    newUser.save(function(err){
		      if(err){
		        req.flash('error',err);
		        return res.redirect('/');
		      }
		      req.session.user = newUser;//用户信息存入session
		      req.flash('success','注册成功!');
		      res.redirect('/show');
		    });
	  	});
	});

	app.get('/show',function(req,res){
	    User.getQuestion(function(data){
	    	for(var i=0,l=data.length;i<l;i++){
	    		data[i].url="/people/"+data[i].name;
	    	}
	    	res.render('show',{
	    		lists:data,
	    		user:req.session.user,
	    	});
	    }); 
	});

	app.get('/getQuestion',function(req,res){
		User.getQuestionPage(req.query.page,function(data){
	    	res.send(data)
	    }); 
	});

	app.get('/people/:user',function(req,res){
	    User.get(req.params.user, function(err, user){
	    	if(!user){
		        req.flash('error','用户不存在!'); 
		        return res.redirect('/error');
		    }else{
		    	User.getEdit(req.params.user,function(err,user){
		    		if(!!user){
		    			if(!user.address){
							user.address="暂无";
					    }
					    if(!user.company){
							user.company="暂无";
					    }
					    if(!user.school){
							user.school="暂无";
					    }
					    if(!user.info){
							user.info="暂无";
					    }

					    User.getQuestionUser(req.params.user,function(question){

					    	res.render('people',{
					          address: user.address,
					          company: user.company,
					          school : user.school,
					          info : user.info,
					          name:req.params.user,
					          user:req.session.user,
					          question:question
					        });
					    });    
		    		}else{
		    			var user={};
		    			user.address="暂无";
		    			user.company="暂无";
		    			user.school="暂无";
		    			user.info="暂无";

		    			User.getQuestionUser(req.params.user,function(question){

					    	res.render('people',{
					          address: user.address,
					          company: user.company,
					          school : user.school,
					          info : user.info,
					          name:req.params.user,
					          user:req.session.user,
					          question:question
					        });
					    });

		    		}
			    })
		    }    
	    });
	});

	app.post('/people',function(req,res){

		var newUser = new User({
	      name: req.session.user.name,
	      address: req.body.address,
	      company:req.body.company,
	      school:req.body.school,
	      info:req.body.info
	  	});
		User.getEdit(newUser.name, function(err, user){
		    if(err){
		      req.flash('error', err);
		      return res.redirect('/error');
		    }

		    if(user){
		    	newUser.updataEdit(function(err){
			      if(err){
			        req.flash('error',err);
			        return res.redirect('/');
			      }
			      req.session.user = newUser;//用户信息存入session
			      req.flash('success','注册成功!');
			      res.redirect('/people/'+newUser.name);
			    });
		    }else{
		    	newUser.edit(function(err){
			      if(err){
			        req.flash('error',err);
			        return res.redirect('/');
			      }
			      req.session.user = newUser;//用户信息存入session
			      req.flash('success','注册成功!');
			      res.redirect('/show');
			    });
		    }
		    
		});
	    //res.render('people');
	});

	app.get('/question/:id',function(req,res){
		User.findQuestion(req.params.id, function(err, items){
			
			res.render('question',{
				items:items[0],
		    	user:req.session.user,
		    	id:req.params.id,
		    	
		    });
		});
	});

	app.get('/error',function(req,res){
		res.render('404', { 
	    	title:"知道",
	    	name:"问答平台",
	    	user:req.session.user,
	    	error: req.flash('error').toString()
	    });
	});

	app.post('/ask',function(req,res){
		var ask={};
		ask.title=req.body.title;
		ask.askText=req.body.askText;
		ask.answer=[];
		ask.name=req.session.user.name;
		User.ask(ask,function(err, doc){
			if(err){
				req.flash('error',err);
			    return res.redirect('/');
			}
			res.send({"status": 1});
		})
	});


	app.post('/answer',function(req,res){
		var answer={};
		answer.answer=req.body.answer;
		answer.user=req.session.user;
		questionId=req.body.questionId;

		User.answer(questionId,answer,function(info){

			res.redirect('/question/'+questionId);
		})
	});

	//后台管理
	app.post('/admin',function(req,res){
		es.render('adminlogin', { 
	    	user:req.session.user,
	    	error: req.flash('error').toString()
	    });
	});

};
