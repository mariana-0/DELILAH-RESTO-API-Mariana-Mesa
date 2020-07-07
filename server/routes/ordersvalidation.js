const express = require('express');
const server = express ();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilahresto');

server.use(express.json());

function DoesOrderExist(req,res,next){
    const order_id = req.params.order_id;
    const SelectQuery = 'SELECT * FROM orders'

    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const orders_list = response;
            const order = orders_list.find( (element) => element.order_id === Number(order_id));

            if (!order){
                return res.status(404).send('Not found')
            }else{
                next();
            }
            
        }).catch((e)=>console.log(e));
}

function VerifyUser(req,res,next){
    const {id_user}=req.body
    const SelectQuery = 'Select * from users'
    
    sequelize.query(SelectQuery,{type:sequelize.QueryTypes.SELECT})
        .then((response)=>{
            const users_list = response;
            const user = users_list.find ((element) => element.user_id === Number(id_user));
            if (!user){
                return res.status(404).send(`User with id: ${id_user} does not exist`)
            }
            else{
                next();
            }
            
        }).catch((e)=>console.log(e));

}

async function VerifyProducts (req,res,next){
    const {items} = req.body;
    let a = false;
    let error = 'Hi';
    let order_description = '';
    let order_total_paid = 0;

    for(let i=0;i<items.length;i++){
        const productID = items[i].id_product;
        const [ExistentProduct] = await ProductById(productID)
        
        if(ExistentProduct.length){
            const productQ = items[i].quantity_product;
            
            if (productQ){
                order_description = `${order_description}${productQ}x${ExistentProduct[0].product_name} `;
                order_total_paid = order_total_paid +(ExistentProduct[0].product_price * productQ)
            } else{
                
                a = true;
                error = 'Data are missing';
                break;
            }
            
        }else{
            a = true;
            error = `Product with id: ${productID} does not exist`;
            break;
        }
        
    }
    if(a){
        return res.status(400).send(error)
    }else{
        req.order_total_paid = order_total_paid;
        req.order_description = order_description;
        next();
    }
}

async function ProductById(id){
    const SelectQuery = 'Select * from products where product_id = ?'
    const product = await sequelize.query(SelectQuery,{raw: true,replacements: [id]});
    return product;
}  


module.exports = {DoesOrderExist,VerifyUser,VerifyProducts}