var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var index = require('./routes/index');
var users = require('./routes/users');////////
var goods = require('./routes/goods');
var session = require('express-session');//###########
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function (req,res,next) {
//   if(req.cookies.userId){
//     next();
//   }else{
//       console.log("url:"+req.originalUrl);
//       if(req.originalUrl=='/users/login' || req.originalUrl=='/users/logout' || req.originalUrl.indexOf('/goods/list')>-1){
//           next();
//       }else{
//           res.json({
//             status:'10001',
//             msg:'当前未登录',
//             result:''
//           });
//       }
//   }
// });


// // 使用 session 中间件##########
// app.use(session({
//   secret :  'secret', // 对session id 相关的cookie 进行签名
//   resave : true,
//   saveUninitialized: false, // 是否保存未初始化的会话
//   cookie : {
//     maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
//   },
// }));


// next();表示可以执行接下来的所有操作
app.use(function(req, res, next) {
  // 如何拦截用户登入，我们通过res.cookie存值，cookie客户端存储，所以是从客户端传来的，我们用req来取
  if (req.cookies.userId) { // 拿到userId，说明已经登入了
    next(); // 那就可以执行下面的任何步骤了
  }else {
    // 设置白名单
    // if (req.originalUrl == '/users/login' || req.originalUrl == '/users/logout' || req.originalUrl.indexOf('/goods/list')> -1) {
    if (req.originalUrl == '/users/login' ||
        req.originalUrl == '/users/logout' ||
        req.path == '/goods/list' ||
        req.path == '/cartList') { //更好的方案
      next();
    }else {
      res.json({
        status: '10001',
        msg: '当前未登入',
        result: ''
      })
    }
  }
});

app.use('/', index);
app.use('/goods', goods);
app.use('/users', users);/////////


// 获取主页#############
// app.get('/', function (req, res) {
//   if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
//     res.render('goods',{username : req.session.userName});
//   }else{
//     res.redirect('login');
//   }
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
