const express = require('express');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');
const router = express.Router();
const {JWT,signature} = require('../jwt');

var user_userv;
var user_emailv;
var user_emailc;
var user_passwordc;

router.get('/', (req,res)=>{
    const SelectQuery = 'SELECT * FROM users';

    sequelize.query(SelectQuery, {type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        }).catch((e)=>console.log(e));
})

router.post('/',fullDataUsers,userAlreadyExists,(req,res)=>{
    const InsertQuery = 'INSERT INTO users(user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin) VALUES (?,?,?,?,?,?,?,?)';
    const {user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin} = req.body;
    console.log(req.body)
    sequelize.query(InsertQuery,{replacements:[user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin]})
        .then((response)=>{
            res.json(req.body)
        }).catch((e)=>console.error(e));
})

router.post('/log_in',DoesThisUserExist,(req,res)=>{
    const {user_email,user_password} = req.body
    const token = JWT.sign(user_email,signature);
    console.log(token)
    console.log(req.body)
    res.json('Welcome')
})

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
            user_userv = users_list.find( (element) => element.user_user == user_user);
            user_emailv = users_list.find ((element) => element.user_email == user_email);

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
            user_passwordc = users_list.find ((element) => element.user_password == user_password);

            if (!user_emailc || !user_passwordc){
                return res.status(409).send('Wrong email/password')
            }else{
                next();
            }
            
        }).catch((e)=>console.log(e));
}
module.exports = router