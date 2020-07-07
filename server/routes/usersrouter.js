const express = require('express');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');
const router = express.Router();
const {JWT,signature} = require('../jwt');
const validations = require('./uservalidation');

router.get('/',validations.verifyToken,validations.isAdmin,(req,res)=>{
    const SelectQuery = 'SELECT * FROM users';

    sequelize.query(SelectQuery, {type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        }).catch((e)=>console.log(e));
})

router.post('/',validations.fullDataUsers,validations.userAlreadyExists,(req,res)=>{
    const InsertQuery = 'INSERT INTO users(user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin) VALUES (?,?,?,?,?,?,?,?)';
    const {user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin} = req.body;
    sequelize.query(InsertQuery,{replacements:[user_user,user_name,user_lastname,user_email,user_phone_number,user_address,user_password,is_admin]})
        .then((response)=>{
            res.status(201).json(req.body)
        }).catch((e)=>console.error(e));
})

router.post('/log_in',validations.DoesThisUserExist,(req,res)=>{
    const {user_email,user_password} = req.body
    const token = JWT.sign(user_email,signature);
    console.log(token)
    res.json('Welcome')
})

module.exports = router