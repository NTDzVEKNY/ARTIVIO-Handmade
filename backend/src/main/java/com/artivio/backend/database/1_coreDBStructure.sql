-- init database
CREATE DATABASE IF NOT EXISTS handmade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE handmade;

-- 1. Users
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories
CREATE TABLE categories (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE,
                            slug VARCHAR(100) NOT NULL UNIQUE,
                            parent_id INT NULL DEFAULT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Products
CREATE TABLE products (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          artisan_id INT NOT NULL DEFAULT 0,
                          category_id INT NULL, -- Để NULL để nếu xóa category thì sản phẩm không bị mất (SET NULL)
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price DECIMAL(20,2) NOT NULL,
                          image TEXT NULL,
                          status ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE',
                          quantity_sold INT NOT NULL DEFAULT 0,
                          stock_quantity INT NOT NULL DEFAULT 0,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Chats
CREATE TABLE chats (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       customer_id INT NOT NULL,
                       artisan_id INT NOT NULL,
                       product_id INT NULL,
                       status ENUM('PENDING', 'NEGOTIATING', 'ORDER_CREATED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
                       title VARCHAR(255) NULL,
                       description TEXT NULL,
                       budget DECIMAL(20,2) NULL,
                       reference_image TEXT NULL,
                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                       FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE,
                       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 5. Chat Messages
CREATE TABLE chat_messages (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               chat_id INT NOT NULL,
                               sender_id INT NOT NULL,
                               is_image TINYINT(1) NOT NULL DEFAULT 0, -- 0: text, 1: image
                               message TEXT NOT NULL,
                               sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
                               FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Orders
CREATE TABLE orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id INT NOT NULL,
                        artisan_id INT NOT NULL,
                        chat_id INT NULL,
                        total_price DECIMAL(10,2) NOT NULL,
                        phone_number VARCHAR(15) NOT NULL,
                        address TEXT NOT NULL,
                        note VARCHAR(255) NULL,
                        payment_method VARCHAR(50) NOT NULL,
                        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
                        FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE RESTRICT,
                        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE SET NULL
);

-- 7. Order Items
CREATE TABLE order_items (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             order_id INT NOT NULL,
                             product_id INT NULL, -- Để NULL để giữ lịch sử nếu sản phẩm bị xóa
                             quantity INT NOT NULL,
                             price_order DECIMAL(10,2) NOT NULL, -- Giá snapshot tại thời điểm mua
                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 8. OTPs
CREATE TABLE otps (
                      id BIGINT NOT NULL AUTO_INCREMENT,
                      name VARCHAR(255),
                      email VARCHAR(255),
                      password VARCHAR(255),
                      code VARCHAR(255),
                      expires_at DATETIME,
                      PRIMARY KEY (id)
);