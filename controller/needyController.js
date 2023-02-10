const cloudinary = require('cloudinary');
const { ObjectId } = require('mongodb');


//? Basic login and authentication
exports.needyRegistration = async (req, res) => {
    
    try
    {
        let certificateList = [];
        const db = global.db.db('amhackerthon');
        const collection = db.collection('blind');
        const {phone} = req.body;

        const verifyNewUser = await collection.findOne({phone});

        if(verifyNewUser)
            return res.status(400).json({status: false, msg: "Please go for the login process!!"});

        if (req.files) 
        {
            let result = await cloudinary.v2.uploader.upload(req.files.proof.tempFilePath, {
                folder: 'blindCertificateProof',
                width:450,
                height:650,
                crop:"scale"
            });

            certificateList.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }

        req.body.proof = certificateList.length > 0 ? certificateList : null;
        req.body.role = "needy";
        req.body.education = JSON.parse(req.body.education);
        req.body.needyPermission = true;
        req.body.postedExams = [];

        let user = await collection.insertOne(req.body);

        if (!user)
            return res.status(400).json({ status: false });

        res.status(200).send(user);
    }
    catch (error) 
    {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }

}

exports.needyLogin = async (req, res) => {

    try
    {
        let {phone} = req.body;
        
        const db = global.db.db('amhackerthon');
        const collection = db.collection('blind');

        const getTheNeedy = await collection.findOne({phone});

        if(!getTheNeedy)
            return res.status(400).json({status: false, msg: "Go for the registration process!!"});
        
        res.status(200).send(getTheNeedy);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({status: false, msg: "Internal server error!!"});
    }

}

//? Making a exam patch for the writer

exports.createExamPost = async (req, res) => {

    try
    {
        const {centerCity, centerState, centerAddress, centerName, examSubject, examDate, examDuration, examTiming, examLanguage, needyId} = req.body;

        const db = global.db.db('amhackerthon');
        const collection = db.collection('blind');
        const collectionForExamPost = db.collection('exampost');

        let verifyNeedy = await collection.findOne({_id: new ObjectId(needyId)});

        if(!verifyNeedy)
            return res.status(400).json({status: false, msg: "Please go for login or registration!!"});
        
        req.body.postStatus = true;
        let examPost = await collectionForExamPost.insertOne(req.body);

        let examPatch = verifyNeedy.postedExams;
        examPatch.push({needyExamPostId: examPost.insertedId});

        if(await collection.updateOne({_id: new ObjectId(needyId)}, {$set:{"postedExams":examPatch}}))
            return res.status(200).send(examPost);
        
        res.status(400).json({status: false, msg: "Unable to post the examPatch please try again!!!"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).status({status: false, msg: "Internal server error!!"});
    }
}

exports.updateTheExamPost = async (req, res) => {
    try
    {
        const {centerCity, centerState, centerAddress, centerName, examSubject, examDate, examDuration, examTiming, examLanguage, needyId, postStatus} = req.body;

        const postId = req.params.postId;

        const db = global.db.db('amhackerthon');
        const collection = db.collection('blind');
        const collectionForExamPost = db.collection('exampost');

        let verifyNeedy = await collection.findOne({_id: new ObjectId(needyId)});

        if(!verifyNeedy)
            return res.status(400).json({status: false, msg: "Please go for login or registration!!"});
        
        let examPost = await collectionForExamPost.findOne({_id: new ObjectId(postId)});

        if(await collectionForExamPost.updateOne({_id: new ObjectId(postId)}, {$set:{centerCity, centerState, centerAddress, centerName, examSubject, examDate, examDuration, examTiming, examLanguage, needyId, postStatus}}))
            return res.status(200).send(examPost);

        res.status(400).json({status: false, msg: "Unable to post the examPatch please try again!!!"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).status({status: false, msg: "Internal server error!!"});
    }
}

exports.deleteTheExamPost = async (req, res) => {

    try
    {
        let postId = req.params.postId;
        
        const db = global.db.db('amhackerthon');
        const collection = db.collection('blind');
        const collectionForExamPost = db.collection('exampost');

        let getTheNeedyPost = await collection.findOne({postedExams:[{needyExamPostId: new ObjectId(postId)}]});
        peArray = getTheNeedyPost.postedExams;

        let newPeArray = [];

        for(let i=0 ; i<peArray.length ; i++)
        {
            if(JSON.stringify(peArray[i].needyExamPostId) !== JSON.stringify(new ObjectId(postId)))
                newPeArray.push(peArray[i]);
        }

        if(await collection.updateOne({_id: getTheNeedyPost._id}, {$set:{"postedExams":newPeArray}}))
        {
            if(await collectionForExamPost.deleteOne({_id: new ObjectId(postId)}))
                return res.status(200).json({status: true, msg: "Record deleted Successfully!!!"});
        }
        else
            res.status(400).json({status: false, msg: "Issues detected at the deletetion of record!!"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send("Internal server error!!");
    }

}

