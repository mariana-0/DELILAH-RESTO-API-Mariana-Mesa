const express = require('express');
const body = require('body-parser');
const server = express ();
const productsrouter = require('./routes/productsrouter');
const usersrouter = require('./routes/usersrouter');


server.use(body.json());
server.use(express.json());

server.use('/products',productsrouter)

server.use('/products/:product_id',productsrouter)

server.use('/users',usersrouter)

server.use('/users/log_in',usersrouter)


server.listen(3000, () => {
    console.log('Server working!')
});