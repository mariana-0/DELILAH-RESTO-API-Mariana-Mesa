const express = require('express');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');
const router = express.Router();
const validations = require('./uservalidation');
const ordervalidations = require('./ordersvalidation');

router.get('/',validations.verifyToken,validations.isAdmin,(req,res)=>{
    const SelectJoinQuery = 'SELECT orders.*, users.user_name, users.user_lastname, users.user_address FROM orders JOIN users ON orders.id_user = users.user_id';

    sequelize.query(SelectJoinQuery, {type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            res.json(response);
        }).catch((e)=>console.log(e));
})

router.get('/:order_id',validations.verifyToken,validations.isAdmin,ordervalidations.DoesOrderExist,(req,res)=>{
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

router.post('/',validations.verifyToken,ordervalidations.VerifyUser,VerifyProducts,(req,res)=>{
    const InsertQuery = 'INSERT INTO orders (order_status,order_time,order_description,order_payment_method,order_total_paid,id_user) VALUES (?,?,?,?,?,?)'
    const {order_payment_method,items,id_user} = req.body

    const time = new Date ();
    const order_time = time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
    const order_status = 'New';

    sequelize.query(InsertQuery,{replacements:[order_status, order_time, order_description, order_payment_method, order_total_paid, id_user]})
        .then((response)=>{
            const [order_id]=response
            const InsertQueryP = 'INSERT INTO order_products (id_order, id_product, quantity_product) VALUES (?,?,?)'
            items.forEach(element => {
                sequelize.query(InsertQueryP,{replacements:[order_id,element.id_product,element.quantity_product]})
            });
            res.json('Dio')
        }).catch((e)=>{console.error(e)})

});

router.put('/:order_id',validations.verifyToken,validations.isAdmin,ordervalidations.DoesOrderExist,(req,res)=>{
    const id = req.params.order_id;
    const {order_status}=req.body;

    const UpdateQuery = `UPDATE orders SET order_status= ? WHERE order_id = ${id}`

    sequelize.query(UpdateQuery, {replacements:[order_status]})
        .then((response)=>{
            res.json({status: 'Updated', products:req.body})
        }).catch((e)=>console.error(e))
})

async function VerifyProducts (req,res,next){
    const {items} = req.body;
    let a = false;
    let error = 'Hi';
    order_description = '';
    order_total_paid = 0;

    for(let i=0;i<items.length;i++){
        const productID = items[i].id_product;
        const [ExistentProduct] = await ProductById(productID)
        
        if(ExistentProduct.length){
            const productQ = items[i].quantity_product;
            
            if (productQ){
                order_description = `${order_description}${productQ}x${ExistentProduct[0].product_name} `;
                order_total_paid = order_total_paid +(ExistentProduct[0].product_price * productQ)
                console.log(order_description); 
                console.log(order_total_paid)
            } else{
                
                a = true;
                error = 'Quantity es required';
                break;
            }
            
        }else{
            console.log(`This is ${a}`)
            a = true;
            error = `Product with id: ${productID} does not exist`;
            break;
        }
        
    }
    console.log(a)
    if(a){
        return res.status(409).send(error)
    }else{
        
        next();
    }
}

async function ProductById(id){
    const SelectQuery = 'Select * from products where product_id = ?'
    const product = await sequelize.query(SelectQuery,{raw: true,replacements: [id]});
    return product;
} 

module.exports = router