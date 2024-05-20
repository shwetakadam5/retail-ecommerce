-- Query to fetch all categories along with product details
SELECT c.id, c.category_name, (p.id, p.product_name,p.price,p.stock, p.category_id)AS products
	FROM category c
JOIN product p ON p.category_id = c.id;	

-- Query to fetch all products along with categories and tags details
SELECT p.id, p.product_name, p.price, p.stock , p.category_id , c.id, c.category_name, pt.product_id, t.tag_name
FROM product p
JOIN category c ON c.id = p.category_id
JOIN product_tag pt ON pt.product_id = p.id
JOIN tag t ON t.id = pt.tag_id