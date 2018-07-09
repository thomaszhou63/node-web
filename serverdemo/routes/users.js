/**
 * Created by zhoubowen on 2018/5/11.
 */
let express = require('express');
let router = express.Router();
let User = require('../models/user');


// 登入接口
router.post('/login', function(req, res, next) {

  let param = {
    userName: req.body.userName, // post请求获取参数就是通过req.body.xxx
    userPwd: req.body.userPwd
  };

  User.findOne(param, function(err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      });
    }else {
      if (doc) {
        // 利用cookie-parser中间件进行cookie操作
        // （cookie的名称，cookie的值，参数）
        res.cookie('userId', doc.userId, {
          path: '/', // cookie放在根目录里面
          maxAge: 1000*60*60 // 设置保存周期为一个小时
        });
        // req.session.userName = doc.userName;//#####
        // res.redirect('/');
        res.json({
          status: 0,
          msg: '',
          result: {
            userName: doc.userName
          }
        });
      }
    }
  })
});

// 登出接口
router.post('/logout', function(req, res, next) {
  // 通过查询到该用户的cookie，然后将userId设置为空，然后将maxAge设为-1,直接失效
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  // req.session.userName = null; // 删除session#######
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
});

//校验
router.get('/checkLogin', function(req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result:req.cookies.userId
    });
  }else {
    res.json({
      status: '1',
      msg: '未登录',
      result:''
    });
  }
});

// 查询当前用户的购物车数据购物车列表
router.get('/cartList',function(req, res, next) {
  let userId = req.cookies.userId;
  User.findOne({userId: userId}, function(err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      });
    }else {
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: doc.cartList // 取到用户的购物车数据
        });
      }
    }
  })
});


// 删除购物车商品的数量
router.post('/cartDel', function(req, res, next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;

  let conditions = {userId: userId},
      update = {
        // $pull(参数)是删除对应参数的数据：例如下面是删除cartList中productList字段匹配到我们需要查询的productId的数据
        $pull: {
          'cartList': {
            'productId': productId
          }
        }
      };
  User.update(conditions , update, function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: '删除成功'
        })
      }
    }
  })
});

//
router.post('/cartEdit', function(req, res, next) {
  let userId = req.cookies.userId;
  let productNum = req.body.productNum,
    productId = req.body.productId,
    checked = req.body.checked;

  let conditions = {'userId':userId, 'cartList.productId': productId},
      update = {
        'cartList.$.productNum': productNum,
        'cartList.$.checked': checked
      };
  User.update(conditions, update, function(err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: '修改成功'
        })
      }
    }

  })
})


// 全选
router.post("/editCheckAll", function (req,res,next) {
  var userId = req.cookies.userId,
    checkAll = req.body.checkAll?'1':'0';

  User.findOne({userId:userId}, function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        // 挨个赋值，然后利用save方法保存修改
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function (err1,doc) {
          if(err1){
            res.json({
              status:'1',
              msg:err1,message,
              result:''
            });
          }else{
            res.json({
              status:'0',
              msg:'',
              result:'suc'
            });
          }
        })
      }
    }
  });
});

//查询用户地址接口
router.get("/addressList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList // 数据保存到result字段
      });
    }
  })
});

//设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else {
    //   User.update({userId:userId, 'addressList.addressId': addressId}, {
    //     'addressList.$.isDefault': true
    //   }, function(err, doc) {
    //     if(err){
    //       res.json({
    //         status:'1',
    //         msg:err.message,
    //         result:''
    //       });
    //     }else{
    //       res.json({
    //         status:'0',
    //         msg:'',
    //         result:'suc'
    //       });
    //     }
    //   });
    // }
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        // var addressList = doc.addressList;
        doc.addressList.forEach((item, i) => {
          if (item.addressId === addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        });

        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: ''
            });
          }
        })
      }
    });
  }
});


//删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:''
      });
    }
  });
});
module.exports = router;


