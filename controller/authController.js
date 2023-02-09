const {sendOtp, verifyOtp} = require('../util/otp');

exports.userOtpSend = async (req, res) => {
    try 
    {
        const {phone} = req.body;
        // mongoClient = await connectWithDb();
        const db = global.db.db('spotgrage');
        const collection = db.collection('users');
        // let user = await collection.findOne({phone});

        (await sendOtp(phone)) ? res.status(200).json({status: true , message : "User already exist!!"}) : res.status(400).json({status: false ,  message : "User does not exist!!"});   
    }
    catch (error) 
    {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

exports.userOtpVerify = async (req , res , next) => {
    try 
    {
        const {phone , otp} = req.body;
        if(await verifyOtp(phone , otp))
            res.status(200).json({status: true});
        else
            res.status(400).json({status: false});
    } 
    catch (error) 
    {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
}