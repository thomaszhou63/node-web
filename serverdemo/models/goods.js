var mongoose = require('mongoose')
var Schema = mongoose.Schema;// 表模型

// 定义商品模型
var produtSchema = new Schema({
  "productId":{type:String},
  "productName":{type:String},
  "productPrice":{type: Number},
  "productNum":{type:Number},
  "checked": {type:String},
  "productImg":{type:String},
});

// 坑：
//   step1: 首先我们在数据库dumall的数据表命名一定要加s，例如goods
//   step2: 然后我们在此处进行创建的表模型，例如我们要查找数据库dumall的数据表goods集合，然后我们在第一个参数写Good(写good也可以)就是直接匹配mongodb的goods(就是说匹配的时候模型加个s后缀再匹配),
//         code: module.exports = mongoose.model('Good',produtSchema);


//   如果不执行step2，就执行step3: 如果，我们不按step2的要求来，例如我们创建的集合是good，那么如果第一个参数还是用good进行匹配就会出错，因为找不到goods；
//           所以，我们就要加第三个参数（也就是我们要匹配的数据库的集合的名字）
//         code: module.exports = mongoose.model('Good',produtSchema,'good');

module.exports = mongoose.model('Good',produtSchema);
