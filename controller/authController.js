const {sendOtp, verifyOtp} = require('../util/otp');

exports.userOtpSend = async (req, res) => {
    try 
    {
        const {phone} = req.body;

        (await sendOtp(phone)) ? res.status(200).json({status: true , message : "otp send success!!"}) : res.status(400).json({status: false ,  message : "Issues while sending the otp!!"});   
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