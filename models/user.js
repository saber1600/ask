var mongodb = require('./db'); 
  
  
function User(user){ 
  this.name = user.name; 
  this.password = user.password; 
  this.email = user.email; 
  this.address = user.address; 
  this.company=user.company; 
  this.school=user.school; 
  this.info=user.info; 
  this.imgUrl=user.imgUrl; 
}; 
  
module.exports = User; 
  
User.prototype.save=function(callback){ 
  var user = { 
      name: this.name, 
      password: this.password 
  }; 
  
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    db.collection('user',function(err,collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      collection.insert(user,{safe: true},function(err,result){ 
        mongodb.close(); 
        callback(err, user);//成功！返回插入的用户信息 
      }); 
    }); 
  }) 
} 
  
User.prototype.edit=function(callback){ 
  var user = { 
      name: this.name, 
      address:this.address, 
      company:this.company, 
      school:this.school, 
      info:this.info, 
      imgUrl:this.imgUrl 
  }; 
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    db.collection('info',function(err,collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      collection.insert(user,{safe: true},function(err,result){ 
        mongodb.close(); 
        callback(err, user);//成功！返回插入的用户信息 
      }); 
    }); 
  }); 
}; 
  
User.prototype.updataEdit=function(callback){ 
  var user = { 
      name: this.name, 
      address:this.address, 
      company:this.company, 
      school:this.school, 
      info:this.info, 
      imgUrl:this.imgUrl 
  }; 
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    db.collection('info',function(err,collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      var upUser={}; 
      if(user.address!=""){ 
        upUser.address=user.address; 
      } 
      if(user.company!=""){ 
        upUser.company=user.company; 
      } 
      if(user.school!=""){ 
        upUser.school=user.school; 
      } 
      if(user.info!=""){ 
        upUser.info=user.info; 
      } 
      if(user.imgUrl!=""){ 
        upUser.imgUrl=user.imgUrl; 
      } 
      collection.update({'name':user.name},{$set:upUser},function(err,result){ 
        mongodb.close(); 
        callback(err, user);//成功！返回插入的用户信息 
      }); 
    }); 
  }); 
}; 
  
User.get = function(name, callback){//读取用户信息 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('user', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.findOne({ 
        name: name 
      },function(err, doc){ 
        mongodb.close(); 
        if(doc){ 
          var user = new User(doc); 
          callback(err, user);//成功！返回查询的用户信息 
        } else { 
          callback(err, null);//失败！返回null 
        } 
      }); 
    }); 
  }); 
}; 
  
User.getEdit = function(name, callback){//读取用户信息 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('info', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.findOne({ 
        name: name 
      },function(err, doc){ 
        mongodb.close(); 
        if(doc){ 
          callback(err, doc);//成功！返回查询的用户信息 
        } else { 
          callback(err, null);//失败！返回null 
        } 
      }); 
    }); 
  }); 
}; 
  
User.ask = function(ask, callback){//读取用户信息 
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    var date = new Date(); 
    var time = { 
      date: date, 
      year : date.getFullYear(), 
      month : date.getFullYear() + "-" + (date.getMonth()+1), 
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(), 
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() 
    } 
    ask.time=time; 
    ask.hide=true; 
  
    db.collection('question',function(err,collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
  
      collection.find().sort({time:-1}).toArray(function(err,items){ 
        if(items.length==0){ 
          ids=0; 
        }else{ 
          ids=items[0]._id; 
          ids++; 
        } 
        ask._id=ids; 
        collection.insert(ask,{safe: true},function(err,result){ 
          mongodb.close(); 
          callback(err, ask);//成功！返回插入的用户信息 
        }); 
      }); 
    }); 
  }) 
}; 
  
User.getQuestion=function(callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    //console.log("open"); 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.find({hide:{$ne:false}}).limit(5).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        //二次查询 
        var open=0 
        db.collection('info', function(err, collection){ 
          for(var i=0,l=items.length;i<l;i++){ 
            collection.findOne({name: items[i].name},function(err, doc){ 
              items[open].imgUrl=doc.imgUrl; 
              open++; 
              if(open==l){ 
                //这里阻塞的话，会阻塞整个网站 
                // function sleep(milliSeconds) { 
                //   var startTime = new Date().getTime(); 
                //   while (new Date().getTime() < startTime + milliSeconds); 
                // } 
                // sleep(10000); 
  
                //console.log("close"); 
                mongodb.close(); 
                return callback(items); 
              } 
            }); 
          } 
              //从这里发现异步问题 
              // collection.findOne({name: items[0].name},function(err, doc){ 
              //   items[0].imgUrl=doc.imgUrl; 
              //   open++; 
              //   if(open==l){ 
              //     mongodb.close(); 
              //     return callback(items); 
              //   } 
              // }); 
              // collection.findOne({name: items[1].name},function(err, doc){ 
              //   items[1].imgUrl=doc.imgUrl; 
              //   open++; 
              //   if(open==l){ 
              //     mongodb.close(); 
              //     return callback(items); 
              //   } 
              // }); 
              // collection.findOne({name: items[2].name},function(err, doc){ 
              //   items[2].imgUrl=doc.imgUrl; 
              //   open++; 
              //   if(open==l){ 
              //     mongodb.close(); 
              //     return callback(items); 
              //   } 
              // }); 
        }); 
        //mongodb.close(); 
        //遍历数据 
        //return callback(items); 
      }); 
    }); 
  }); 
}; 
  
//查询用户的头像地址，测试用联表查询用 
User.getUserUrl=function(userName,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
  
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        //mongodb.close(); 
        return callback(err); 
      } 
        //查找用户名 name 值为 name文档 
        var open=0; 
        collection.find().toArray(function(err,items){ 
          // open++ 
          // if(open==2){ 
          //   mongodb.close(); 
          // } 
          for(var i=0,l=items.length;i<l;i++){ 
            db.collection('info', function(err, collection){ 
              collection.find({name:items[i].name}).toArray(function(err, items){ 
                open++; 
                if(open==l){ 
                  mongodb.close(); 
                } 
              }); 
            }); 
          }    
        }); 
        // db.collection('question', function(err, collection){ 
        //   collection.find().toArray(function(err, items){ 
        //     var qq; 
        //     open++; 
        //     if(open==2){ 
        //       mongodb.close(); 
        //     } 
        //   }); 
        // });     
    }); 
  }); 
}; 
  
  
User.getQuestionPage=function(page,callback){ 
  //打开数据库 
  var num=page*5; 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.find().skip(num).limit(5).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        //遍历数据 
        return callback(items); 
      }); 
    }); 
  }); 
}; 
  
  
User.getQuestionUser=function(user,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.find({name:user}).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        //遍历数据 
        return callback(items); 
      }); 
    }); 
  }); 
}; 
  
  
User.findQuestion=function(id,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档find({'last_name': 'Smith'}) 
      collection.find({_id:Number(id)}).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        //遍历数据 
        return callback(err,items); 
      }); 
    }); 
  }); 
}; 
  
  
User.answer=function(questionId,answer,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //update({_id:0},{$push:{aihao:'football'}}); 
      collection.update({_id:Number(questionId)},{$push:{answer:answer}},function(err,items){ 
        var l; 
        if(err) throw err; 
        mongodb.close(); 
        return callback(items); 
      }); 
      // .toArray(function(err,items){ 
      //   if(err) throw err; 
      //   mongodb.close(); 
      //   //遍历数据 
      //   return callback(err,items); 
      // }); 
    }); 
  }); 
}; 
//暂时 
//这里默认name==tang为超级管理员 
User.superAdmin=function(name,psd,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('user', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.find({ name : 'tang' }).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        if(psd==items[0].password){ 
          return callback("true"); 
        }else{ 
          return callback("false"); 
        } 
        //遍历数据 
        //return callback(items); 
      }); 
    }); 
  }); 
}; 
  
User.getQuestionAdmin=function(callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      collection.find().limit(10).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        //遍历数据 
        return callback(items); 
      }); 
    }); 
  }); 
}; 
  
User.adminChange=function(change,id,childId,delAndRe,callback){ 
  //打开数据库 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //读取 users 集合 
    db.collection('question', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //查找用户名 name 值为 name文档 
      if(delAndRe=="del"){ 
        if(childId==""){ 
          collection.update({'_id':Number(id)},{$set:{hide:false}},function(err,info){ 
            if(err) throw err; 
            mongodb.close(); 
            callback(info);//成功！返回插入的用户信息 
          }); 
        }else{ 
          collection.update({"answer.answer":childId},{$set:{hide:false}},function(err,info){ 
            if(err) throw err; 
            mongodb.close(); 
            callback(info);//成功！返回插入的用户信息 
          }); 
        } 
      }else{ 
        if(childId==""){ 
          collection.update({'_id':Number(id)},{$set:{hide:true}},function(err,info){ 
            if(err) throw err; 
            mongodb.close(); 
            callback(info);//成功！返回插入的用户信息 
          }); 
        }else{ 
          collection.update({"answer.answer":childId},{$set:{hide:true}},function(err,info){ 
            if(err) throw err; 
            mongodb.close(); 
            callback(info);//成功！返回插入的用户信息 
          }); 
        } 
      }  
    }); 
  }); 
}