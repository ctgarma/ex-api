var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let db={
    localhost:'mongodb://localhost:27017/StockMarket',
    mlab:''
}

mongoose.connect(db.localhost);

module.exports = {mongoose};
