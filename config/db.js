const MongoClient = require('mongodb').MongoClient;

const connectWithDb = async () => {

    let mongoClient;
    try
    {
        mongoClient = new MongoClient(process.env.DB_URL);
        await mongoClient.connect();
        console.log("Connected successfully!!");
        return mongoClient;
    }
    catch(err)
    {
        console.error("Connection to mongodb atlas failed!!", err);
        process.exit(1);
    }

}

module.exports = connectWithDb;