var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  "userId":String,
  "userName":String,
  "userPwd":String,
  "orderList":Array,////////后期要补齐
  "cartList":[
    {
      "productId":String,
      "productName":String,
      "productPrice":String,
      "productImg":String,
      "checked":String,
      "productNum":Number
    }
  ],
  "addressList":[
    {
      "addressId": String,
      "userName": String,
      "streetName": String,
      "postCode": Number,
      "tel": Number,
      "isDefault": Boolean
    }
  ]
});

module.exports = mongoose.model("user",userSchema);
