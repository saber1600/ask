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
	app.get('/admin',function(req,res){
		res.render('adminlogin', { 
	    	user:req.session.user,
	    	error: req.flash('error').toString()
	    });
	});

	app.post('/adminLogin',function(req,res){
		var adminName=req.body.name;
		var md5 = crypto.createHash('md5'),
	      adminPwd = md5.update(req.body.password).digest('hex');
		User.superAdmin(adminName,adminPwd,function(info){
			if(info=="true"){
				// res.render('adminlogin', { 
			 //    	user:req.session.user,
			 //    	error: req.flash('error').toString()
			 //    });
			    res.redirect('/admincon');

			}else{
				res.redirect('/show');
			}
			
		});		
	});

	app.get('/admincon',function(req,res){
		User.getQuestionAdmin(function(data){
	    	res.render('admincon',{
	    		lists:data,
	    		user:req.session.user,
	    	});
	    });

	});

	app.post('/adminchange',function(req,res){
		var change=req.body.change,
			id=req.body.id,
			childId=req.body.childId,
			delAndRe=req.body.delAndRe
		User.adminChange(change,id,childId,delAndRe,function(data){
			if(data==1){
				res.redirect('/admincon');
			}
	    });
	});

	app.get('/baike',function(req,res){
		var request = require('request'),
		    cheerio = require('cheerio'),
		    http = require('http'),
		    url = require('url');
		var host = 'http://baike.baidu.com/view/39744.htm';//可修改为其他的百科地址

		var html = [];
		  request(host, function (error, response, data) {
		    if (!error && response.statusCode == 200) {
		      var $ = cheerio.load(data);
		      var title = $('.title').first().text(),
		          header = [],
		          nav = [],
		          body = [];
		      //删除无用数据
		      $('.title').remove();
		      $('.pic-info').remove();
		      $('.count').remove();
		      $('sup').remove();
		      //筛选有用数据
		      $('#lemmaContent-0 .headline-1').each(function (i) {
		        var str = '',
		            $next = $(this).next();
		        while (!$next.hasClass('headline-1')&&(!$next.next().hasClass('clear'))) {
		          if ($next.hasClass('headline-2')) {
		            str += "<p><strong>" + $next.text() + "</strong></p>";
		          } else {
		            str += "<p>" + $next.text() + "</p>";
		          }
		          $next = $next.next();
		        }
		        header.push($(this).find('.headline-content').text());
		        nav.push("<span><a href='/" + i + "'>" + header[i] + "</a></span>");
		        body.push(str);
		      });

		      var len = $('#catalog-holder-0 .catalog-item').length;//获取 “目录” 条文数
		      for (var i = 0; i < len;  i++) {
		        html[i] = "" +
		        "<!DOCTYPE html>" +
		        "<html>" +
		        "<head>" +
		        "<meta charset='UTF-8' />" +
		        "<title>" + title + "</title>" +
		        "<style type='text/css'>" +
		        "body{width:600px;margin:2em auto;font-family:'Microsoft YaHei';}" +
		        "p{line-height:24px;margin:1em 0;}" +
		        "header{border-bottom:1px solid #cccccc;font-size:2em;font-weight:bold;padding-bottom:.2em;}" +
		        "nav{float:left;font-family:'Microsoft YaHei';margin-left:-12em;width:9em;text-align:right;}" +
		        "nav a{display:block;text-decoration:none;padding:.7em 1em;color:#000000;}" +
		        "nav a:hover{background-color:#003f00;color:#f9f9f9;-webkit-transition:color .2s linear;}" +
		        "</style>" +
		        "</head>" +
		        "<body>" +
		        "<header>" + header[i] + "</header>" +
		        "<nav>" + nav.join('') + "</nav>" +
		        "<article>" + body[i] + "</article>" +
		        "</body>" +
		        "</html>";
		      }
		      // res.writeHead(200, {"Content-Type":"text/html"});
			  // res.write(html[0]);
			  // res.end();
			  res.send(html[1]);

		    }
		  });
		

	});

};