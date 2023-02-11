const cloudinary = require('cloudinary');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const {sendOtp} = require('../util/otp');


// Basic login and authentication
exports.writerRegistration = async (req, res) => {

    try 
    {
        const {phone} = req.body;
        let certificateList = [];
        let profileList = [];
        const db = global.db.db('amhackerthon');
        const collection = db.collection('writer');
        
        const verifyNewUser = await collection.findOne({phone});

        if(verifyNewUser)
            return res.status(400).json({status: false, msg: "Please go for the login process!!"});

        if (req.files) 
        {
            let result1 = await cloudinary.v2.uploader.upload(req.files.certificate.tempFilePath, {
                folder: 'writerCertificates',
                width:450,
                height:650,
                crop:"scale"
            });
            
            let result2 = await cloudinary.v2.uploader.upload(req.files.profile.tempFilePath, {
                folder: 'writerProfile',
                width:250,
                height:250,
                crop:"scale"
            });

            certificateList.push({
                id: result1.public_id,
                secure_url: result1.secure_url
            });

            profileList.push({
                id: result2.public_id,
                secure_url: result2.secure_url
            });
        }
        else
            return res.status(400).json({ status: false });

        req.body.certificate = certificateList;
        req.body.profile = profileList;
        req.body.role = "writer";
        req.body.writerPermission = true;
        req.body.age = parseInt(req.body.age);
        req.body.pincode = parseInt(req.body.pincode);
        req.body.acceptedExams = [];

        let user = await collection.insertOne(req.body);

        if (!user)
            return res.status(400).json({ status: false });

        res.status(200).send(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

exports.writerLogin = async (req, res) => {

    try
    {
        let {phone} = req.body;
        
        const db = global.db.db('amhackerthon');
        const collection = db.collection('writer');

        const getTheWriter = await collection.findOne({phone});

        if(!getTheWriter)
            return res.status(400).json({status: false, msg: "Go for the registration process!!"});
        
        res.status(200).send(getTheWriter);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({status: false, msg: "Internal server error!!"});
    }

}

exports.getTheNeedyList = async (req, res) => {

    try
    {
        const {writerId} = req.body;
        const db = global.db.db('amhackerthon');
        const collection = db.collection('exampost');
        const writerCollection = db.collection('writer');

        let writerInfo = await writerCollection.findOne({_id: new ObjectId(writerId)});

        if(!writerInfo)
            return res.status(400).json({status: false, msg: "Please go for the registration!!"});

        let needyList = await collection.find({examLanguage:{$in:writerInfo.preferredLanguages}, postStatus: true}).toArray();
        res.status(200).send(needyList);
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({status: false, msg: "Internal server error!!"});
    }

}

exports.acceptTheNeedyRequest = async (req, res) => {

    try
    {
        let {examPostId, writerId} = req.body;
        
        const db = global.db.db('amhackerthon');
        const collection = db.collection('exampost');
        const writerCollection = db.collection('writer');
        const needyCollection = db.collection('blind');

        let examPostDoc = await collection.findOne({_id: new ObjectId(examPostId)});
        let examPostDetail = [];
        let writerInfo = await writerCollection.findOne({_id: new ObjectId(writerId)});
        let needyInfo = await needyCollection.findOne({_id: new ObjectId(examPostDoc.needyId)});
        
        if(await collection.updateOne({_id: new ObjectId(examPostId)},{$set:{postStatus: false}}))
        {
            examPostDetail.push({
                examPostId: examPostDoc._id, 
                needyId: examPostDoc.needyId, 
                centerCity: examPostDoc.centerCity, 
                centerName: examPostDoc.centerName});
            
            if(await writerCollection.updateOne({_id: new ObjectId(writerId)}, {$set: {acceptedExams: examPostDetail}}))
            {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.APP_EMAIL,
                        pass: process.env.APP_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.APP_EMAIL,
                    to: writerInfo.email,
                    subject: "Congratulations you have successfully accepted the exam post",
                    text: "Details for the Examination" + `\nBlind Person Name : ${needyInfo.name}\nContact : ${needyInfo.phone}\nGender : ${needyInfo.gender}\nCenter City : ${examPostDoc.centerCity}\nCenter State : ${examPostDoc.centerState}\nCenter Address : ${examPostDoc.centerAddress}\nExam Date : ${examPostDoc.examDate}\nExam Duration : ${examPostDoc.examDuration} hrs\nExam Timing : ${examPostDoc.examTiming}\nExam Language: ${examPostDoc.examSubject}`
                };

                transporter.sendMail(mailOptions, function(err, info){
                    if(err)
                        console.log(err);
                    else
                        console.log("Email sent: " + info.response);
                });

                if(await sendOtp(needyInfo.phone, false))
                    return res.status(200).json({status: true, message: "You have successfully accepted the exam post!!"});
            }
        }
        
        return res.status(400).json({status: false, msg: "Issues while confirmation of exam post!!"});

    }
    catch(err)
    {
        console.log(err);
        return res.status(500).json({status: false, msg: "Internal server error!!"});
    }

}