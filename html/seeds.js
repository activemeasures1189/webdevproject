const mongoose = require('mongoose');
const Product = require('./models/products');

mongoose.connect('mongodb://localhost:27017/shopApp', {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("Products Database connected!");
}).catch((err)=>{
    console.log("Error: " + err)
})

const seeds = [
    {
    name: 'Orange',
    price: 5,
    category: 'fruit'
    },
    {
        name: 'Eggplant',
        price: 25,
        category: 'vegetable'
        },
        {
            name: 'cabbage',
            price: 15,
            category: 'vegetable'
            }
,
{
    name: 'Pear',
    price: 3,
    category: 'fruit'
    }
]
Product.insertMany(seeds).then((result)=>{
    console.log(result)
}).catch((e)=>{
    console.log("Error: " + e)
})
