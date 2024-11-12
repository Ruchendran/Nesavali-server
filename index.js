const dotenv=require("dotenv");
dotenv.config({path:'./config.env'});
const cors=require("cors");
const express=require("express");
const jwt=require("jsonwebtoken");
const path=require("path");
const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const index=express();
index.use(cors());
index.use(express.json());
let db=null;

const dbPath=path.join(__dirname,"users.db");

const port=process.env.port || 300


initiate=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        index.listen(port,()=>{
            console.log(`server Runnning at  ${port}`)
        })
    }
    catch(e){
        console.log(`DB error:${e.message}`);
        process.exit(1);
    }
}


initiate();

index.get("/get",async(request,response)=>{
    // const que=`
    // select * from lead
    // `;
    // const data=await db.all(que);
    // console.log(data);
    // response.send(data)
    console.log(request.headers)
    response.send({
        status:300,
        success:"Ur api is succcesss"
    })
});

//This is user login request
index.post("/login",async(request,response)=>{
     const data=request.body;
     
     const getUserQue=`select * from ourUsers 
     where mail='${data.mail}'`;
     const getUserDet=await db.get(getUserQue);
     if(getUserDet){
        const jwtAuth=jwt.verify(getUserDet.password,'Nesavali');
        if(jwtAuth===data.password){
            response.send({
                passwordStatus:true,
                userDet:getUserDet,
                userStatus:true
            })
        }
        else{
            response.send({
                passwordStatus:false,
                userStatus:true
            })
        }
     }
     else{
        response.send({
            userStatus:false
        })
     }
   

})
//usr Register request.
index.post('/register',async(request,response)=>{
    const data=request.body;
    const selQue=`select * from ourUsers`;
    const usersList=await db.all(selQue);
    const checkUser=usersList.find((list)=>{
       return list.mail===data.mail
    });

 
    if(checkUser===undefined){
        const jwt_token=jwt.sign(data.password,'Nesavali');

        const que=`
        insert into ourUsers (name,password,mail)
        values 
        (
            '${data.name}','${jwt_token}','${data.mail}'
        )
        `;
    
        const fetchData=await db.run(que);
        response.send({
            statusCode:200,
            success:true,
        });
    }
    else{
        response.send({
            status:'User Already exists'
        })
    }
});






//Admin apis

index.get('/select',async(request,response)=>{
    const que=`select * from ourUsers`;
    const sel=await db.all(que);
    // console.log(sel)
    if(sel!==undefined){
        response.send(sel)
    }
    else{
        response.send({data:"nulll"})
    }

})


