const cors = require("cors");
const e = require('express');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');

const {  generateFile   } = require("./generateFile");
const { executeCpp } = require("./executeCpp"); 
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');
const Job = require("./models/Job");


mongoose.connect("mongodb://localhost/compilerapp",{
    useNewUrlParser: true,
    useUnifiedTopology:true,
},(err)=>{
    if(err){
        console.log(err);
        process.exit(1);
    }
    console.log("Successfully connected to mongodb database!");
});


const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.post("/run",async (req, res) => {

    const {language="cpp" , code } = req.body;  //default cpp
    console.log(language, code.length);
    if(code === undefined)
    {
        return res.status(400).json({success: false, error: "Empty code body"});
    }

    let job;

try{    

    //generate a c++ file from request        
    //run the file & send o/p as response
    const filepath = await generateFile(language,code);


    job =await new Job({language,filepath}).save();
    const jobId = job["_id"];
    console.log(job);

    res.status(201).json({success:true,jobId});



    let output;
    
    job["startedAt"] = new Date();

    if(language==="cpp"){
        output = await executeCpp(filepath); 
    }
    else if(language ==="py") {
        output = await executePy(filepath);
    }
    else{
        output = await executeJava(filepath);
    }


    job["completedAt"] = new Date();
    job["status"]="success";
    job["output"]=output;

    await job.save();

    console.log(job);
    //return res.json({filepath,output});
    }

catch (err){

    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(err);

    await job.save();

    console.log(job);
    //res.status(500).json({err});
}
});


app.listen(5000, ()  => {
    console.log(`Listening on port 5000!`);
});