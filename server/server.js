const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const cors = require('cors');
const _ = require('lodash');
const cookieParser = require('cookie-parser');

var corsOptions = {
    origin: '*',
    exposedHeaders: 'x-auth'
}

const app = express();
const port = process.env.PORT || 3200;
app.use(cors(corsOptions));
app.options('*', cors())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const {
    ObjectID
} = require('mongodb');

var {
    mongoose
} = require('./db/mongoose');

const {
    Share
} = require('./models/share');

const {
    User
} = require('./models/user');

var {
    authenticate
} = require('./middleware/authenticate');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send('API online...');
});

//login user
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    console.log(body);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            console.log(token);
            res.cookie('token', token, { maxAge: 36000000 }).header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send('invalid username and password');
        console.log(e);
    });
});


// add  users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'firstname', 'lastname']);
    var user = new User(body);
    user.save().then(() => {
        console.log(`user saved:${user.email}`);
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        console.log(e);
        res.status(400).send(e);
    })
});

//retrieve info
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});


//log out 
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send('error');
    });
});



//add new shares
app.post('/shares', authenticate, (req, res) => {
    var shares = req.body;
    var price;

    var newShare = new Share({
        symbol: shares.symbol,
        company_name: shares.company_name,
        buy_price: shares.buy_price,
        no_shares: shares.no_shares,
        last_price: shares.last_price,
        market: shares.market,
        currency: shares.currency,
        buy_date: shares.buy_date,
        _creator: req.user._id
    });

    newShare.save().then((doc) => {
        console.log('saved', doc);
        res.status(200).send('item saved');
    }, (e) => {
        console.log('Unable to save data', e);
        res.status(401).send(e);
    });

});

//retrieve lists grouped by symbol, market, company, last price
app.get('/shares/list', authenticate, (req, res) => {

    Share.find({ _creator: req.user._id }).then((shares) => {
        var body = _.map(shares, e => _.pick(e, ['_id', 'symbol', 'market', 'company_name', 'no_shares', 'last_price', 'value', 'buy_price', 'gains', 'buy_date']));

        var result = _.chain(body).groupBy("symbol").map(function (v, i) {
            return {
                symbol: i,
                company_name: _.get(_.find(v, 'company_name'), 'company_name', ''),
                market: _.get(_.find(v, 'market'), 'market', ''),
                last_price: _.get(_.find(v, 'last_price'), 'last_price', 0),
                no_shares: _.sumBy(v, 'no_shares'),
                value: _.sumBy(v, 'value'),
                details: v
            }
        });
        res.status(200).send(result);
    }).catch((e) => {
        res.status(400).send(`No shares found,${e}`);
    })
});

//retrieve share
app.get('/shares/list/:id', authenticate, (req, res) => {
    id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('invalid ID')
        return res.status(404).send();
    } else {
        Share.find({
            _id: id,
            _creator: req.user._id
        }).then((share) => {            
            if (share.length===0) {
                console.log('no record found with that ID');
                return res.status(404).send(req.user.id);
            }
            console.log('share retrieved',share.length);
            res.status(200).send(share);
        }).catch((e) => {
            res.status(400).send();
        });
    }
});

//delete share
app.delete('/shares/:id', authenticate, (req, res) => {
    id = req.params.id;

    if (!ObjectID.isValid(id)) {
        console.log('invalid ID')
        return res.status(404).send();
    } else {
        Share.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        }).then((share) => {            
            if (!share) {
                console.log('no record found with that ID');
                return res.status(404).send(req.user.id);
            }
            res.status(200).send('share removed from the list');
        }).catch((e) => {
            res.status(400).send(e);
        });
    }
});

//update share
app.patch('/shares/:id', authenticate, (req, res) => {
    id = req.params.id;
    body = _.pick(req.body, ['symbol','company_name','cost_price','buy_date','no_shares','market','currency','last_price']);
    if (!ObjectID.isValid(id)) {
        console.log('invalid ID')
        return res.status(404).send();
    }

    Share.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true }).then((share) => {
        if (!share) {
            console.log('error share not found');
            return res.status(404).send('error encounted');
        }
        res.send({ share });
    }).catch((e) => {
        res.status(400).send();
    })

});

var server = app.listen(port, () => {
    console.log(`server running on port ${server.address().port}`);
});