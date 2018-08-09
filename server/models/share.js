var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shareSchema = new Schema(
    {
        symbol: {
            type: String,
            required:true,
            trim:true,
            minLength:1
        },
        company_name: {
            type: String
        },
        buy_price:{
            type:Number
        },
        last_price: {
            type: Number
        },
        no_shares: {
            type: Number
        },
        market: {
            type: String
        },
        currency: {
            type: String
        },
        percent_change: {
            type: Number
        },
        last_update:{
          type:Date
        },
        buy_date:{
            type:Date
          },
        _creator:{
          require:true,
          type:mongoose.Schema.Types.ObjectId
        }
    });

shareSchema.virtual('value').get(function(){
  return (this.no_shares* this.last_price);
}); 

shareSchema.virtual('gains').get(function(){
    return ((this.last_price-this.buy_price)*this.no_shares);
  }); 
  
var Share = mongoose.model('share',shareSchema );

module.exports ={Share};
