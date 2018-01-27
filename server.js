var restify = require('restify');
var plugins = require('restify').plugins;
var mysql = require('mysql');


var server = restify.createServer();
var db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password : process.env.DB_PSW || 'Medas@123',
    port : process.env.DB_PORT || 3306, //port mysql
    database:process.env.DB_NAME || 'eclinic_clinica_new'
});

db.connect((err)=>{
    if(err) throw err;
    console.log("DB Connected.");
});

server.use(plugins.bodyParser({ mapParams: false }));
server.post("/", (req,res)=>{
    console.log(req.body.result);
    switch (req.body.result.action) {
        case "CheckVote":
            res.json(checkVote(req.body.result.parameters.age))
            break;
        case "getPatientByMobile":
            getPatientByMobile(req.body.result.parameters.mobileNumber, (err,result)=>{
                res.json(result)
            })
            break;
        default:
            res.json({speech:"Not possible", displayText:"Not possible"});
            break;
    }
});


function checkVote(age){
    if(!age)
        return {speech:"You can vote after the age of 18 years in India.", displayText:"You can vote at the age of 18 years in india."};
    else if(parseInt(age.amount) < 18)
        return {speech:"You are not eligible for voting in India.", displayText:"You are not eligible for voting in India."};
    else if(parseInt(age.amount) >= 18)
        return {speech:"You are eligible for voting in India. Vote wisely.", displayText:"You are eligible for voting in India. Vote wisely."};
}

function getPatientByMobile(mobileNumber, next){
    if(!mobileNumber)
        return next(null,{speech:"I don't have patient number", displayText:"I don't have patient number"});
    
    const query = "SELECT * from new_registration where mobile=" + mobileNumber;
    // console.log(query);
    db.query(query,(err, result)=>{
        // console.log(err, result);
        if(err) return next(null,{speech:"Get patient service not working. Please try again.", displayText:"Get patient service not working. Please try again."});
        if(!result.length)
            return next(null,{speech:"No records find with this mobile number", displayText:"No records find with this mobile number"});

        return next(null,{speech:patientInfo(result[0]), displayText:result[0].patient_name});

    });
}

function patientInfo(patientObj){
    let string = "Patient name is " + patientObj.patient_name + ","
    if(patientObj.sex == "Male"){
        string = string + "He is from " + patientObj.nationality + "."
        string = string + "He is " + patientObj.patient_age + " years old."
        // if(!patientInfo.marital_status)
    }
    else{
        string = string + "She is from " + patientObj.nationality + "."
        string = string + "She is " + patientObj.patient_age + " years old."
    }
    return string;
}

server.listen(3000,()=>{
    console.log("server started");
});