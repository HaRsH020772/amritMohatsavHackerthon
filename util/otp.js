const Client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtp = async (number) => {

    try 
    {
        const message = await Client.verify.services(process.env.MESSAGE_SERVICE_SID).verifications.create({
            to: number,
            channel: "sms"
        });
        return true;
    }
    catch (error) 
    {
        console.log(`Error:${error}`);
        return false;
    }
}

const verifyOtp = async (number, otp) => {

    try 
    {
        const verificationCheck = await Client.verify.services(process.env.MESSAGE_SERVICE_SID).verificationChecks.create({
            to: number,
            code: otp
        });
        if(verificationCheck.status == 'approved')
            return true;
        else
            return false;
    } 
    catch (error) 
    {
        console.log(error);
    }
}

module.exports = {
    sendOtp,
    verifyOtp
}



