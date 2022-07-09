import './App.css';
import React,{useState} from 'react';
import axios from 'axios';

function App() {

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output,setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");


  const handleSubmit = async () =>{

    const payload = {
      language,
      code

    };

    try{
    setJobId("");
    setStatus("");
    setOutput("");
    
    const {data} = await axios.post("http://localhost:5000/run",payload);
    console.log(data);
    setJobId(data.jobId);
    let intervalId;
    
    intervalId = setInterval( async()=>{

      const{ data: dataRes } = await axios.get("http://localhost:5000/status",{params :{ id:data.jobId}});

      const {success, job, error} = dataRes;
      console.log(dataRes);

      if(success){
        const {status: jobStatus, output: jobOutput } =job;
        setStatus(jobStatus);

        if(jobStatus == "pending") return;
        setOutput(jobOutput);
        clearInterval(intervalId);

      }
      else{
        setStatus("Error: Please retry!");
        console.error(error);
        clearInterval(intervalId);
        setOutput(error);
      }



      console.log(dataRes);


    },1000);







    }
    catch (error) {
      //console.log(error.response.data);
      //
      if (error.response.data) {
        setOutput(error.response.data.err.stderr);
      } 
      else {
        setOutput("Error connecting to server!");
      }
    }
  };

  return (
    <div className="App">
    <h1> Test Compiler v1</h1>
    <div>
      <label> Language: </label>
    <select

      value={language}
      onChange={(e)=>{
        setLanguage(e.target.value);
        //console.log(e.target.value);

      }}>
    <option value="cpp">C++</option>
    <option value="java">Java</option>
    <option value="py">Python</option>
    </select>
    </div>
    <br/>

    <textarea rows="35" cols="110" value = {code} onChange={(e)=>{
          setCode(e.target.value);
    }}></textarea>
    <br/>
    <button onClick={handleSubmit}>Submit</button>
    <p>{status}</p>
    <p>{jobId && `JobID: ${jobId}`}</p>

    <p className="output">{output}</p>

    </div>
  );
}

export default App;
