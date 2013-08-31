var crypto = require('crypto'); 
var User = require('../models/user.js'); 
// 移动文件需要使用fs模块 
var fs = require('fs'); 
  
//引用过呢插件 
var images = require("node-images"); 
  
//国外插件 
var gm = require('gm'); 
var imageMagick = gm.subClass({ imageMagick : true }); 
  
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
            newUser.save(function(err,user){ 
              if(err){ 
                req.flash('error',err); 
                return res.redirect('/'); 
              } 
              req.session.user = user;//用户信息存入session 
              req.flash('success','注册成功!'); 
  
                //在info表中生成一组个人信息 
                var newUser = new User({ 
                  name: user.name, 
                  address: "暂无", 
                  company:"暂无", 
                  school:"暂无", 
                  info:"暂无", 
                  imgUrl:"./public/images/11.jpg", 
                }); 
                newUser.edit(function(err){ 
                    if(err){ 
                        req.flash('error',err); 
                        return res.redirect('/'); 
                    } 
                    req.session.user = newUser;//用户信息存入session 
                }); 
              res.redirect('/show'); 
            }); 
        }); 
    }); 
  
    app.get('/show',function(req,res){ 
        User.getQuestion(function(data){ 
            for(var i=0,l=data.length;i<l;i++){ 
                data[i].url="/people/"+data[i].name; 
                //目前只支持jpg显示 
                //data[i].imgUrl="images/user/pic_"+data[i].name+".jpg"; 
                data[i].imgUrl=data[i].imgUrl.replace("./public/",""); 
            }    
            res.render('show',{ 
                lists:data, 
                user:req.session.user 
            }); 
        });  
    }); 
    //测试用 
    app.get('/test',function(req,res){ 
        // User.getUserUrl(function(data){ 
        //  var pp; 
        // }); 
  
        /* 
        下面代码需要安装imagemagick 
        http://www.imagemagick.org/script/index.php 
        window可以直接安装
        mac去http://cactuslab.com/imagemagick/ 下载安装 With XQuartz support 版本的
        依靠库gm 
        https://github.com/aheckmann/gm 
        */
        imageMagick("./public/images/user/pic.jpg") 
        .resize(150, 150, '!') //加('!')强行把图片缩放成对应尺寸150*150！ 
        .autoOrient() 
        .write("./public/images/user/pic11.jpg", function(err){ 
            if (err) { 
                console.log(err); 
                //res.end(); 
            } 
            //下面是删除图片 
            // fs.unlink("./public/images/user/pic.jpg", function() { 
            //  //return res.end('3'); 
            // }); 
        }); 
  
  
        /* 
        //国内一个插件 
        //https://github.com/zhangyuanwei/node-images 
        //不需要安装其他附属软件 
        */
        // images("./public/images/user/pic.jpg").size(400).save("./public/images/user/output.jpg", { 
        //     quality : 7                     
        // }); 
  
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
                //读取用户信息 
                User.getEdit(req.params.user,function(err,user){ 
                    if(!!user){//如果用户有编辑信息 
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
                        if(!user.imgUrl){ 
                            user.imgUrl="images/11.jpg"; 
                        }else{ 
                            user.imgUrl=user.imgUrl.replace("./public/",""); 
                        } 
  
                        User.getQuestionUser(req.params.user,function(question){ 
  
                            res.render('people',{ 
                              address: user.address, 
                              company: user.company, 
                              school : user.school, 
                              info : user.info, 
                              name:req.params.user, 
                              user:req.session.user, 
                              question:question, 
                              imgUrl:user.imgUrl 
                            }); 
                        });     
                    } 
                    // else{//新用户第一次打开，没有信息生成默认值 
                    //  var user={}; 
                    //  user.address="暂无"; 
                    //  user.company="暂无"; 
                    //  user.school="暂无"; 
                    //  user.info="暂无"; 
                    //  user.imgUrl="images/11.jpg"; 
                    //  User.getQuestionUser(req.params.user,function(question){ 
  
                       //   res.render('people',{ 
                       //        address: user.address, 
                       //        company: user.company, 
                       //        school : user.school, 
                       //        info : user.info, 
                       //        name:req.params.user, 
                       //        user:req.session.user, 
                       //        question:question, 
                       //        imgUrl:user.imgUrl 
                       //      }); 
                       //  }); 
                    // } 
                }) 
            }     
        }); 
    }); 
  
    app.post('/people',function(req,res){ 
        //头像地址 
        var tmp_path,target_path; 
  
        if(req.files.thumbnail.size>0){ 
            tmp_path = req.files.thumbnail.path; 
            // 指定文件上传后的目录 - 示例为"images"目录。 
            // 重命名图片名字 
            var picType=req.files.thumbnail.name.split("."); 
            picType=picType[1]; 
            target_path = './public/images/user/pic_' + req.session.user.name+"."+picType; 
            //target_path = './public/images/user/pic_' + req.files.thumbnail.name; 
            // 移动文件 
            fs.rename(tmp_path, target_path, function(err) { 
              if (err) throw err; 
              // 删除临时文件夹文件,  
              // fs.unlink(tmp_path, function() { 
              //   if (err) throw err; 
              //   res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes'); 
              // }); 
            }); 
        } 
          
        var newUser = new User({ 
          name: req.session.user.name, 
          address: req.body.address, 
          company:req.body.company, 
          school:req.body.school, 
          info:req.body.info, 
          imgUrl:target_path, 
        }); 
        User.getEdit(newUser.name, function(err, user){ 
            if(err){ 
              req.flash('error', err); 
              return res.redirect('/error'); 
            } 
            if(user){ 
                //用户存在就是更新 
                newUser.updataEdit(function(err){ 
                    if(err){ 
                        req.flash('error',err); 
                        return res.redirect('/'); 
                    } 
                    req.session.user = newUser;//用户信息存入session 
                    //req.flash('success','注册成功!'); 
                    res.redirect('/people/'+newUser.name); 
                }); 
            }else{ 
                //用户不存在，添加新用户信息 
                newUser.edit(function(err){ 
                    if(err){ 
                        req.flash('error',err); 
                        return res.redirect('/'); 
                    } 
                    req.session.user = newUser;//用户信息存入session 
                    //req.flash('success','注册成功!'); 
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
             //     user:req.session.user, 
             //     error: req.flash('error').toString() 
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