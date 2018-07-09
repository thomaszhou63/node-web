// 二级路由
var express = require('express');  // 找主路由
var router = express.Router(); // 或许express框架的路由
var mongoose = require('mongoose'); // 获取mongoose
var Goods = require('../models/goods'); // 加载模型表-goods的

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall',{useMongoClient:true});
// mongoose.connect('mongodb://root:123@127.0.0.1:27017/dumall');//有账号密码的访问，账号root，密码123

// 监听是否连接成功
mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

router.get('/list', function(req,res,next) {
  // mongoose内部的find方法；第一个给是参数，第二是回调函数（错误，文档）
  let page = parseInt(req.param('page'));
  console.log(page);
  let pageSize = parseInt(req.param('pageSize')),
      sort = req.param('sort'),
      skip = (page-1) * pageSize,
      params = {}; // 存放查询条件的
      priceLevel= req.param('priceLevel');

  //对priceLevel进行判断
  let priceGt = '',priceLte = '';
  if (priceLevel !== 'all') { // all就不需要查询，全部输出
    switch (priceLevel) {
      case '0':priceGt = 0;priceLte = 25;break;
      case '1':priceGt = 25;priceLte = 50;break;
      case '2':priceGt = 50;priceLte = 75;break;
      case '3':priceGt = 75;priceLte = 100;break;
    }
    // console.log(priceGt);
    params = {
      // productPrice是筛选条件字段
      productPrice:{
          $gte:priceGt,
          $lte:priceLte
      }
    }
  }

  // params = {"productName" : "启示录"};
  // params = {productPrice : '150'};
  // params = {"productPrice" : {
  //   $gt:95,
  //   $lte:100
  // }};

  // console.log(pageSize);
  // const newDoc  = doc.sort((a, b) => {
  //   return a.list - b.list
  // })
  let goodsModel = Goods.find(params).sort({productPrice: sort});
  goodsModel.skip(skip).limit(pageSize);
  goodsModel.exec({},function(err,doc) {
    if (err) {
      res.json({ // 输出json文件
        status: '1',
        msg: err.message
      });
    }else {
      // console.log(doc);
      res.json({
        status: '0',
        msg: 'success',
        result: {
          count: doc.length,
          list:doc,
          page: page
        }
      })
    }
  })
});

// 加入到购物车(POST)

var User = require('../models/user');

router.post('/addCart', function(req, res, next) {
  let userId = '100000077',
      productId = req.body.productId;
  User.findOne({userId: userId}, function(err, userDoc) { // 拿到用户信息后，我们返回一个userDoc
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      });
    }else {
      User.update({'userId': userId})
      // userDoc保存了某个用户的所有数据

      // 判断购物车是否有该商品，如果有，直接该商品数量+1，如果没有，就添加该商品进去
      goodsItem = '';
      userDoc.cartList.forEach((elem, i) => {
        if (elem.productId === productId) {
          goodsItem = elem;
          elem.productNum += 1;
          //
        }
      });
      if (goodsItem) { // 如果购物车里面有该商品
        // 此时userDoc值de 变化只有elem.productNum +=1，将userDoc保存进去
        userDoc.save(function(err2, doc2) {
          if (err2) {
            res.json({
              status: 1,
              msg: err2.message
            });
          }else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            })
          }
        })
      }else { // 如果购物车里面并没有该商品，就要-->根据得到的productId来查询goods数据表的商品信息，然后将其加入该用户里面
        Goods.findOne({productId: productId}, function(err1, doc) {
          if (err1) {
            res.json({
              status: 1,
              msg: err1.message
            });
          }else {
            if (doc) {
              doc.productNum = 1;
              doc.checked = 1;
              userDoc.cartList.push(doc); // 直接将doc加入到我们的userDoc里面去（就是加入到对应userId的那个人的数据里面）
              // 将userDoc的数据保存到数据中
              userDoc.save(function(err2, doc2) {
                if (err2) {
                  res.json({
                    status: 1,
                    msg: err2.message
                  });
                }else {
                  res.json({
                    status: '0',
                    msg: '',
                    result: 'suc'
                  })
                }
              })
            }
          }
        })
      }
    }
  })
});


//查询商品列表数据，二级路由通过get
// router.get("/list", function (req,res,next) {
//   let page = parseInt(req.param("page"));
//   let pageSize = parseInt(req.param("pageSize"));
//   let priceLevel = req.param("priceLevel");
//   let sort = req.param("sort");
//   let skip = (page-1)*pageSize;
//   var priceGt = '',priceLte = '';
//   let params = {};
//   if(priceLevel!='all'){
//     switch (priceLevel){
//       case '0':priceGt = 0;priceLte=100;break;
//       case '1':priceGt = 100;priceLte=500;break;
//       case '2':priceGt = 500;priceLte=1000;break;
//       case '3':priceGt = 1000;priceLte=5000;break;
//     }
//     params = {
//       salePrice:{
//           $gt:priceGt,
//           $lte:priceLte
//       }
//     }
//   }
//   let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
//   goodsModel.sort({'salePrice':sort});
//   goodsModel.exec(function (err,doc) {
//       if(err){
//           res.json({
//             status:'1',
//             msg:err.message
//           });
//       }else{
//           res.json({
//               status:'0',
//               msg:'',
//               result:{
//                   count:doc.length,
//                   list:doc
//               }
//           });
//       }
//   })
// });

//加入到购物车
// router.post("/addCart", function (req,res,next) {
//   var userId = '100000077',productId = req.body.productId;
//   var User = require('../models/user');
//   User.findOne({userId:userId}, function (err,userDoc) {
//     if(err){
//         res.json({
//             status:"1",
//             msg:err.message
//         })
//     }else{
//         console.log("userDoc:"+userDoc);
//         if(userDoc){
//           var goodsItem = '';
//           userDoc.cartList.forEach(function (item) {
//               if(item.productId == productId){
//                 goodsItem = item;
//                 item.productNum ++;
//               }
//           });
//           if(goodsItem){
//             userDoc.save(function (err2,doc2) {
//               if(err2){
//                 res.json({
//                   status:"1",
//                   msg:err2.message
//                 })
//               }else{
//                 res.json({
//                   status:'0',
//                   msg:'',
//                   result:'suc'
//                 })
//               }
//             })
//           }else{
//             Goods.findOne({productId:productId}, function (err1,doc) {
//               if(err1){
//                 res.json({
//                   status:"1",
//                   msg:err1.message
//                 })
//               }else{
//                 if(doc){
//                   doc.productNum = 1;
//                   doc.checked = 1;
//                   userDoc.cartList.push(doc);
//                   userDoc.save(function (err2,doc2) {
//                     if(err2){
//                       res.json({
//                         status:"1",
//                         msg:err2.message
//                       })
//                     }else{
//                       res.json({
//                         status:'0',
//                         msg:'',
//                         result:'suc'
//                       })
//                     }
//                   })
//                 }
//               }
//             });
//           }
//         }
//     }
//   })
// });

module.exports = router;
