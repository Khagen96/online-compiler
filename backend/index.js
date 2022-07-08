const fs = require('fs');
const express = require('express');
const app = express();
const {  generateFile   } = require("./generateFile");
const { executeCpp } = require("./executeCpp"); 
const cors = require("cors");
const e = require('express');
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/",(req, res) => {
    return res.json({ hello: "world!" });
});

app.post("/run",async (req, res) => {

    const {language="cpp" , code } = req.body;  //default cpp
    console.log(language, code.length);
    if(code === undefined)
    {
        return res.status(400).json({success: false, error: "Empty code body"});
    }


try{    

    //generate a c++ file from request        
    //run the file & send o/p as response
    const filepath = await generateFile(language,code);


    let output;
    
    if(language==="cpp"){
        output = await executeCpp(filepath); 
    }
    else if(language ==="py") {
        output = await executePy(filepath);
    }
    else{
        output = await executeJava(filepath);
    }

    
    return res.json({filepath,output});
    }

catch (err){
    //console.log(err);
    res.status(500).json({err});
}
});


app.listen(5000, ()  => {
    console.log(`Listening on port 5000!`);
});