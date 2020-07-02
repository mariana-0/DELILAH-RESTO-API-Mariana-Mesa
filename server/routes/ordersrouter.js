const express = require('express');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');
const router = express.Router();
const validations = require('./uservalidation');

router.get('/',validations.verifyToken,validations.isAdmin,(req,res)=>{
    const SelectJoinQuery = 'SELECT orders.*, users.user_name, users.user_lastname, users.user_address FROM orders JOIN users ON orders.id_user = users.user_id';

    sequelize.query(SelectJoinQuery, {type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        }).catch((e)=>console.log(e));
})

router.get('/:order_id',validations.verifyToken,validations.isAdmin,DoesOrderExist,(req,res)=>{
    const id = req.params.order_id;
    const SelectJoinQuery = `SELECT products.product_name, products.product_price, order_products.quantity_product, orders.order_total_paid, orders.order_status, orders.order_payment_method, users.user_address, users.user_name, users.user_lastname, users.user_user, users.user_email, users.user_phone_number 
    FROM order_products
    INNER JOIN products ON products.product_id = order_products.id_product
    INNER JOIN orders ON orders.order_id = order_products.id_order
    INNER JOIN users ON orders.id_user = users.user_id WHERE order_id = ${id}`;

    sequelize.query(SelectJoinQuery, {type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        }).catch((e)=>console.log(e));
})

router.post('/',validations.verifyToken,(req,res)=>{
    const InsertQuery = 'INSERT INTO orders (order_status,order_time,order_description,order_payment_method,order_total_paid,id_user) VALUES (?,?,?,?,?,?)'
    const {order_payment_method,items,id_user} = req.body

    const time = new Date ();
    const order_time = time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
    const order_status = 'New';

    sequelize.query(InsertQuery,{replacements:[order_status, order_time, 'order_description', order_payment_method, 1111, id_user]})
        .then((response)=>{
            const [order_id]=response
            const InsertQueryP = 'INSERT INTO order_products (id_order, id_product, quantity_product) VALUES (?,?,?)'
            items.forEach(element => {
                
                sequelize.query(InsertQueryP,{replacements:[order_id,element.id_product,element.quantity_product]})
                    .then((resp)=>{
                        res.json('Dio')
                    }).catch((e)=>console.error(e))
            });
        }).catch((e)=>console.error(e))

});

function DoesOrderExist(req,res,next){
    const order_id = req.params.order_id;
    console.log(order_id)
    const SelectQuery = 'SELECT * FROM orders'

    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const orders_list = response;
            console.log(orders_list)
            const order = orders_list.find( (element) => element.order_id === Number(order_id));
            console.log(order)

            if (!order){
                return res.status(404).send('Order was not found')
            }else{
                next();
            }
            
        }).catch((e)=>console.log(e));
}

module.exports = router