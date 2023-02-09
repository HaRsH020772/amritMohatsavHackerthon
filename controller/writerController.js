const cloudinary = require('cloudinary');
const { ObjectId } = require('mongodb');


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
        req.body.preferredLanguages = JSON.parse(req.body.preferredLanguages);
        req.body.education = JSON.parse(req.body.education);
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

        let needyList = await collection.find({examLanguage:{$in:writerInfo.preferredLanguages}}).toArray();
        res.status(200).send(needyList);
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({status: false, msg: "Internal server error!!"});
    }

}