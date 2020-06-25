TABLE PRODUCTS

CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(60) NOT NULL,
    product_price INT UNSIGNED NOT NULL
)

TABLE USERS

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_user VARCHAR(60) NOT NULL,
    user_name VARCHAR(60) NOT NULL,
    user_lastame VARCHAR(60) NOT NULL,
    user_email VARCHAR(60) NOT NULL,
    user_phone_number INT NOT NULL,
    user_address VARCHAR(60) NOT NULL,
    user_password VARCHAR(60) NOT NULL,
    is_admin TINYINT(1) NOT NULL,
)

TABLE ORDERS

CREATE TABLE orders (
    order_id INT PRIMARY KEY NOT NULL,
    order_status ENUM ('New','Confirmed','Preparing','Sent','Delivered','Canceled') NOT NULL,
    order_time TIME NOT NULL,
    order_description VARCHAR(60) NOT NULL,
    order_payment_method ENUM ('Cash','Card') NOT NULL,
    order_total_paid INT UNSIGNED NOT NULL,
    id_user INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users (user_id)
)

TABLE ORDERS_PRODUCTS

CREATE TABLE order_products (
    op_id INT PRIMARY KEY NOT NULL,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    quantity_product INT NOT NULL,
    FOREING KEY (id_order) REFERENCES orders (order_id),
    FOREIGN KEY (id_product) REFRENCES products (product_id)
)