const mongoose =  require('mongoose');
const cities = require('./cities');
const { places, descriptors }  = require('./seedhelpers')
const Campground = require('../models/campground')

// DATABASE CONNECT
mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology:true

}).then(()=>{
    console.log("CONNECTION ESTABLISHED!")
}).catch((err)=>{
    console.log("Error" + err)
});
const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async()=>{
   for (i = 0; i <10; i++){
       const random100 = Math.floor(Math.random()*10)
       const camp = new Campground({
           location: `${cities[random100].city}, ${cities[random100].state}`,
           title: `${sample(descriptors)} ${sample(places)}`,
           image: 'https://source.unsplash.com/collection/483251',
           description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
        price

       })
       await camp.save();
       
   }

}
// seedDB().then(() => {
//     mongoose.connection.close();
// })
seedDB();
