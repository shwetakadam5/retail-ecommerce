-- Query to fetch all categories along with product details
SELECT c.id, c.category_name, (p.id, p.product_name,p.price,p.stock, p.category_id)AS products
	FROM category c
JOIN product p ON p.category_id = c.id;	