require("dotenv").config();

let connectToDb = require('./config/db');
const cloudinary = require('cloudinary');
const app = require('./app');

(async function globalMongoConnection() {
    global.db = await connectToDb();
})();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.listen(process.env.PORT, () => {
    console.log(`Server is up and running at port ${process.env.PORT}`);
});
