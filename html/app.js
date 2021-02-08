const express=  require('express');
const app = express()
const path = require('path')
const mongoose = require('mongoose');
var methodOverride = require('method-override')
const Product = require('./models/products');
const Farm = require('./models/farm');
const User = require('./models/user');
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const sessionOptions = {
    secret: 'thisisnotagoodsecret',
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
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));


// DATABASE CONNECT
mongoose.connect('mongodb://localhost:27017/shopApp', {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("Products Database connected!");
}).catch((err)=>{
    console.log("Error: " + err)
})
const categories= ['fruit', 'vegetable', 'dairy', 'fungi']

//FLASH MIDDLEWARE
app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

// MIDDLEWARE
 const isLoggedin = (req, res, next) =>{
     
     if(!req.isAuthenticated()){
         req.session.returnTo = req.originUrl;
         req.flash('erro', 'You must be signed it first')
        return res.redirect('/login');
     }
     next();
 }
// *******ROUTES

// *******USER ROUTES
app.get('/register', (req, res)=>{
    res.render('user/register');
});
app.post('/register', async(req, res)=>{
    try{
    const {username, email, password} = req.body;
    const user = new User(req.body);
    const newUser = await User.register(user, password);
    
    req.login((newUser, err)=>{
        if(err){
            return next(err);
        }
    });
    req.flash('success', 'Registered new user!');
    res.redirect('/farms');
} catch(e){
    req.flash('error', e.message);
    res.redirect('/register')
}
})
app.get('/login', (req, res)=>{
    req.flash('success', 'Welcome to login page!');
    res.render('user/login');
})
app.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect:'/login'
}),(req, res)=>{
    req.flash('success', 'Nice to have you back '+req.user.username);
    console.log(req.user.username);
    const redirectUrl = req.session.returnTo || '/farms';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
   
});

app.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success', 'Logged out!');
    res.redirect('/farms');
})
//****************FARM ROUTES
app.get('/', (req, res)=>{
    res.render('farms/home');
})
//FIND ALL FARMS    
app.get('/farms', async (req, res)=>{
    const farms =  await Farm.find({})
    res.render('farms/index', {farms: farms});

})
//  ADD NEW FARM
app.get('/farms/new', isLoggedin, (req, res)=>{
    res.render('farms/new');
});
app.post('/farms', async(req, res)=>{
    const farm = new  Farm(req.body);
     await farm.save();
     req.flash('success', 'New farm added!')
     res.redirect('/farms');
})
// SHOW FARM BY ID
app.get('/farms/:id', async(req, res)=>{
    const farm = await Farm.findById(req.params.id).populate('products');
   res.render('farms/show', {farm:farm});
})
// NEW PRODUCT TO PARTICULAR FARM
app.get('/farms/:id/products/new', (req, res)=>{
    const {id} = req.params;
    res.render('products/new', {categories: categories, id});
})
app.post('/farms/:id/products', async (req, res)=>{
    const {id} = req.params;
    const farm = await Farm.findById(id)
    const product = new Product(req.body);
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`)
})
app.delete('/farms/:id', async (req, res)=>{
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms');
    
})

// *************** PRODUCT ROUTES
 //FIND ALL
app.get('/products', async (req, res)=>{
    const category = req.query;
    if(category){
        const product = await Product.find(category)
        res.render('products/index', {products:product, category:category})
    } else {
    const product = await Product.find({});
   res.render('products/index', {products:product, category})
    }
    
})
//CREATE
app.get('/products/new', (req, res)=>{
    res.render('products/new', {categories});
})
app.post('/products', async(req, res)=>{
    const product = new Product (req.body);
    await product.save();
    res.redirect('/products');

});
// SHOW BY ID
app.get('/products/:id', async (req, res)=>{
    const products = await Product.findById(req.params.id);
    
    res.render('products/show', {products:products});
})
// EDIT BY ID
app.get('/products/:id/edit', async (req, res)=>{
    const products = await Product.findById(req.params.id)
    res.render('products/edit', {product:products});
    
    
})
app.put('/products/:id', async (req, res)=>{
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {runValidators: true, new:true});
    res.redirect(`/products/${product._id}`);
})
//DELETE 
app.delete('/products/:id', async(req, res)=>{
    await Product.findByIdAndRemove(req.params.id);
    res.redirect('/products');
})


app.listen(port, (req, res)=>{
     console.log("Products server is listening on port: " + port);
})