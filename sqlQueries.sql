/* Query 1 */
SELECT *
FROM authors
ORDER BY date_of_birth
LIMIT 10;

/* Query 2 */
SELECT SUM(item_price * quantity) AS total_sales
FROM sale_items
JOIN books ON sale_items.book_id = books.id
JOIN authors ON books.author_id = authors.id
WHERE authors.name = 'Lorelai Gilmore';

/* Query 3 */
SELECT authors.name, SUM(sale_items.item_price * sale_items.quantity) AS total_sales
FROM authors
JOIN books ON authors.id = books.author_id
JOIN sale_items ON books.id = sale_items.book_id
GROUP BY authors.id
ORDER BY total_sales DESC
LIMIT 10;
