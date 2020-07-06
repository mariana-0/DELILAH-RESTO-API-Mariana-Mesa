const express = require('express');
const server = express ();
const {JWT,signature} = require('../jwt');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');

server.use(express.json());

var user_emailc;

function fullDataUsers(req, res, next) {
    const {user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin} = req.body;

    if(!user_user || !user_name || !user_lastname || !user_email || !user_phone_number || !user_address || !user_password || (is_admin!=0 && is_admin!=1)){
        console.log(req.body)
        res.status(400).send('Data are missing');
    } else {
        next();
    }
}

function userAlreadyExists(req,res,next){
    const {user_user,user_email} = req.body;
    
    const SelectQuery = 'SELECT * FROM users'

    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const users_list = response;
            const user_userv = users_list.find( (element) => element.user_user == user_user);
            const user_emailv = users_list.find ((element) => element.user_email == user_email);

            if (user_userv || user_emailv){
                return res.status(409).send('User already exists')
            }else{
                next();
            }
            
        }).catch((e)=>console.log(e));
}

function DoesThisUserExist(req,res,next){
    const {user_email,user_password} = req.body;

    const SelectQuery = 'SELECT * FROM users'

    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const users_list = response;
            user_emailc = users_list.find( (element) => element.user_email == user_email);
            const user_passwordc = users_list.find ((element) => element.user_password == user_password);
            
            if(user_emailc) {var useride = user_emailc.user_id};
            if (user_passwordc) {var useridp = user_passwordc.user_id};

            if (!user_emailc || !user_passwordc || useride != useridp){
                
                return res.status(409).send('Wrong email/password')
            }
            else{
                next();
            }
            
        }).catch((e)=>console.log(e));
}

function verifyToken (req,res,next){
    try {
    const token = req.headers.authorization.split(' ')[1];
    const verifytoken = JWT.verify(token,signature);
        if(verifytoken){
            req.body.user_email = verifytoken.user_email;
            return next();
        }
    }catch (e){
        return res.status(409).send('You are not allowed')
    }   
}
 
function isAdmin (req,res,next){

    const SelectQuery = 'SELECT * FROM users'

    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const user_isadmin = user_emailc.is_admin
            if (user_isadmin==0){
                return res.status(409).send('You are not an administrador')
            }else if(user_isadmin==1){
                next();
            } 
            
        }).catch((e)=>console.log(e));
} 

module.exports = {fullDataUsers,userAlreadyExists,DoesThisUserExist,verifyToken,isAdmin}