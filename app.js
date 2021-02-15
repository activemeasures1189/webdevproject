if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express=  require('express');
const app = express()
const path = require('path')
const mongoose = require('mongoose');
var methodOverride = require('method-override')
// const Campground = require('./models/campground');
// const Review = require('./models/review');
const User = require('./models/user');
const userRoutes = require('./routes/userRoutes');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const {isloggedin, validateReview, validateCampground} = require('./middleware');
const {MongoStore} = require('connect-mongo')
const MongoDBStore = require('connect-mongo')(session);
 const dbUrl = process.env.DB_URL ||  'mongodb://localhost:27017/yelpcamp'
// DATABASE URL
// const dbUrl = 'mongodb://localhost:27017/yelpcamp';

const secret = process.env.SECRET || 'thisisnotagoodsecret'
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionOptions = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionOptions))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname,'public')));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));




// DATABASE CONNECT
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:true,
    useUnifiedTopology: true

}).then(()=>{
    console.log("CONNECTION ESTABLISHED!")
}).catch((err)=>{
    console.log("Error" + err)
})

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

// *****ROUTES***//

//// USER ROUTES
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


//INDEX
app.get('/', (req, res)=>{
    res.render('campgrounds/home');
})

 

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
app.listen(port, (req, res)=>{
    console.log(`Camp server is listening on ${port}!`);
})