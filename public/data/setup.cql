-- ============================================================
-- Retail Workshop - Astra DB Table Setup
-- Run this in the Astra DB CQL Console
--
-- Before running:
--   Replace all occurrences of your-email@example.com
--   with your real email address (3 places below).
-- ============================================================

USE default_keyspace;

-- -- Create tables ---------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
    customer_id          text PRIMARY KEY,
    name                 text,
    email                text,
    loyalty_tier         text,
    join_date            text,
    preferred_categories text
);

CREATE TABLE IF NOT EXISTS orders (
    order_id      text PRIMARY KEY,
    customer_id   text,
    customer_name text,
    items         text,
    total_amount  decimal,
    order_date    text,
    status        text
);

-- -- Insert customers ------------------------------------------

INSERT INTO customers (customer_id, name, email, loyalty_tier, join_date, preferred_categories)
VALUES ('C001', 'Sarah Johnson', 'your-email@example.com', 'Gold', '2022-06-15', 'Outerwear, Hiking');

INSERT INTO customers (customer_id, name, email, loyalty_tier, join_date, preferred_categories)
VALUES ('C002', 'Mike Chen', 'your-email@example.com', 'New Customer', '2025-03-01', 'Running, Trail');

INSERT INTO customers (customer_id, name, email, loyalty_tier, join_date, preferred_categories)
VALUES ('C003', 'Emma Davis', 'your-email@example.com', 'Silver', '2023-11-20', 'Activewear, Running');

-- -- Insert orders ---------------------------------------------

-- Sarah Johnson - Gold customer
INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O001', 'C001', 'Sarah Johnson', 'Summit Hiker GTX', 149.99, '2023-02-10', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O002', 'C001', 'Sarah Johnson', 'FlexCore Compression Tights', 54.99, '2023-08-22', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O003', 'C001', 'Sarah Johnson', 'ThermaFlask 32oz', 29.99, '2024-01-05', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O004', 'C001', 'Sarah Johnson', 'Summit Base Layer Set', 79.99, '2024-11-18', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O005', 'C001', 'Sarah Johnson', 'Arctic Shield Parka', 219.99, '2025-03-28', 'abandoned');

-- Mike Chen - New Customer
INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O006', 'C002', 'Mike Chen', 'TrailRunner Pro 4.0, HydroMax Trail Pack 20L', 184.98, '2025-03-30', 'abandoned');

-- Emma Davis - Silver customer
INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O007', 'C003', 'Emma Davis', 'AllSport Performance Tee', 34.99, '2023-12-05', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O008', 'C003', 'Emma Davis', 'Velocity Windrunner', 74.99, '2024-06-14', 'completed');

INSERT INTO orders (order_id, customer_id, customer_name, items, total_amount, order_date, status)
VALUES ('O009', 'C003', 'Emma Davis', 'TrailBreaker Softshell', 119.99, '2025-03-25', 'abandoned');

-- -- Verify ---------------------------------------------------

SELECT * FROM customers;
SELECT * FROM orders WHERE status = 'abandoned' ALLOW FILTERING;
