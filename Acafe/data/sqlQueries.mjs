export const queries = {
    getCart: `
    SELECT 
    id_cart collate utf8mb4_general_ci  as idCart, 
    id_combo as idCombo,
     name,
     cartview.url, 
     id_productPrice as idProductPrice, 
     product_price as productPrice,
     product_count as count, 
     selected_ingridients as selectedIngrigients,
     existingIngridients ,
     null as comboContent
        FROM cartview
        WHERE id_users=?
               UNION 
          SELECT CONCAT('[',id, ']') , id_combo, combo_name, url, null, unit_price, count,null, null, CONTENT FROM (
    select brawl_cafe.combo.id_combo 
    AS id_combo,brawl_cafe.combo.combo_name 
    AS combo_name,a2.dt AS dt2,
    (select (brawl_cafe.combo.default_price + sum(brawl_cafe.combo_position.added)) 
    from brawl_cafe.combo_position where ((brawl_cafe.combo_position.id_combo = brawl_cafe.combo.id_combo) 
    and brawl_cafe.combo_position.id_productPrice in 
    (select distinct brawl_cafe.cart.id_productPrice from brawl_cafe.cart where (brawl_cafe.cart.dt = dt2)))) AS unit_item,(select sum(brawl_cafe.cart.product_price) 
    from brawl_cafe.cart where (brawl_cafe.cart.dt = dt2)) AS unit_price,a2.TESDF AS id,
  (select GROUP_CONCAT(Products.product_name, ' ', volume) from ProductPrices
join Products on Products.id_product=ProductPrices.id_product
join Cart on Cart.id_productPrice=ProductPrices.id_productPrice 
WHERE cart.id_combo is not null and cart.dt=dt2
and
ProductPrices.id_productPrice in (SELECT Cart.id_productPrice FROM Cart WHERE Cart.dt=dt2)
)AS Content
   ,brawl_cafe.combo.URL AS url,a2.count AS count from (brawl_cafe.combo join (select a1.id_combo AS id_combo,count(0) 
    AS count,substring_index(group_concat(a1.dt separator ','),',',1) AS dt,group_concat(a1.crtID separator ',') AS TESDF,group_concat(a1.crtID separator ',') 
    AS fd from (select brawl_cafe.cart.id_combo AS id_combo,brawl_cafe.cart.dt AS dt,group_concat(distinct brawl_cafe.cart.id_productPrice 
    order by brawl_cafe.cart.id_productPrice ASC separator ',') AS content,group_concat(brawl_cafe.cart.id_cart separator ',') AS crtID 
    from brawl_cafe.cart where ((brawl_cafe.cart.id_users = ?) and (brawl_cafe.cart.id_combo is not null)) 
    group by brawl_cafe.cart.id_combo,brawl_cafe.cart.dt,brawl_cafe.cart.id_users) A1 
    group by a1.id_combo,a1.content) A2 on((a2.id_combo = brawl_cafe.combo.id_combo)))
) A
 `,
        getIngridientsCart: `
        SELECT Cart.*, a.ingridients FROM Cart
        left JOIN (select id_addCart, GROUP_CONCAT(id_ingridient) as ingridients from Choosen_ingridients
        GROUP BY id_addCart) a on a.id_addCart=Cart.id_addCart
        WHERE Cart.id_users=? AND id_productPrice=?
        AND id_combo is null and ingridients is ? 
        `,
    createOrderSql:`
            INSERT INTO Orders 
            (id_order, id_orderStatus, id_users, id_restaurant, adress, ready_time,payment_id) 
            VALUES (NULL, ?, ?, ?, ?, ?, null);
    `,
    unaccessabilityIngridients:`
        SELECT id_ingredient FROM ingredient_inaccessability
        WHERE id_restaurant=?
        and id_ingredient in (SELECT Choosen_ingridients.id_ingridient FROM Cart
        JOIN Choosen_ingridients ON Choosen_ingridients.id_addCart=Cart.id_addCart
        WHERE Cart.id_users=?
        GROUP BY id_ingridient
        union 
        select id_ingridient from (SELECT *, (select ProductPrices.id_product from ProductPrices WHERE cart.id_productPrice=ProductPrices.id_productPrice) as productId FROM cart 
        WHERE CART.id_combo is not null and cart.id_users=?

        ) a
        JOIN (select * from Products_ingridients where added=0) b on b.id_product=productId)
    `,
    moveFromCart: `
    INSERT INTO Cooking(id_order, id_productPrice, product_count, extend, price )
    SELECT id_order, id_productPrice,  CASE WHEN product_count is null then 1 else product_count end as product_count,
    CASE WHEN id_combo is not null THEN null else extends END as extend, a.product_price  as  price
    FROM (
        SELECT (SELECT ?) as id_order, Cart.*,
    (
        SELECT GROUP_CONCAT(Ingredients.ingredient_name) FROM Products_ingridients
    JOIN Ingredients ON Products_ingridients.id_ingridient=Ingredients.id_ingridient
    where Products_ingridients.id_product = 
        (SELECT DISTINCT ProductPrices.id_product FROM ProductPrices WHERE ProductPrices.id_productPrice=Cart.id_productPrice)
        and Ingredients.id_ingridient not in (
            SELECT Choosen_ingridients.id_ingridient FROM Choosen_ingridients
            where cart.id_addCart=Choosen_ingridients.id_addCart
        ) 
    ) as extends
    FROM Cart
    WHERE id_users=?) A
    `

}

// SELECT * FROM Cart
// JOIN Choosen_ingridients ON Choosen_ingridients.id_addCart=Cart.id_addCart
// WHERE Cart.id_users=22


// SELECT CONCAT('[',id, ']') , id_combo, combo_name, url, null, unit_price, count,null, null, CONTENT FROM (
//     select brawl_cafe.combo.id_combo 
//     AS id_combo,brawl_cafe.combo.combo_name 
//     AS combo_name,a2.dt AS dt2,
//     (select (brawl_cafe.combo.default_price + sum(brawl_cafe.combo_position.added)) 
//     from brawl_cafe.combo_position where ((brawl_cafe.combo_position.id_combo = brawl_cafe.combo.id_combo) 
//     and brawl_cafe.combo_position.id_productPrice in 
//     (select distinct brawl_cafe.cart.id_productPrice from brawl_cafe.cart where (brawl_cafe.cart.dt = dt2)))) AS unit_item,(select sum(brawl_cafe.cart.product_price) 
//     from brawl_cafe.cart where (brawl_cafe.cart.dt = dt2)) AS unit_price,a2.TESDF AS id,
//   (select GROUP_CONCAT(Products.product_name, ' ', volume) from ProductPrices
// join Products on Products.id_product=ProductPrices.id_product
// join Cart on Cart.id_productPrice=ProductPrices.id_productPrice 
// WHERE cart.id_combo is not null and cart.dt=dt2
// and
// ProductPrices.id_productPrice in (SELECT Cart.id_productPrice FROM Cart WHERE Cart.dt=dt2)
// )AS Content
//    ,brawl_cafe.combo.URL AS url,a2.count AS count from (brawl_cafe.combo join (select a1.id_combo AS id_combo,count(0) 
//     AS count,substring_index(group_concat(a1.dt separator ','),',',1) AS dt,group_concat(a1.crtID separator ',') AS TESDF,group_concat(a1.crtID separator ',') 
//     AS fd from (select brawl_cafe.cart.id_combo AS id_combo,brawl_cafe.cart.dt AS dt,group_concat(distinct brawl_cafe.cart.id_productPrice 
//     order by brawl_cafe.cart.id_productPrice ASC separator ',') AS content,group_concat(brawl_cafe.cart.id_cart separator ',') AS crtID 
//     from brawl_cafe.cart where ((brawl_cafe.cart.id_users = 22) and (brawl_cafe.cart.id_combo is not null)) 
//     group by brawl_cafe.cart.id_combo,brawl_cafe.cart.dt,brawl_cafe.cart.id_users) A1 
//     group by a1.id_combo,a1.content) A2 on((a2.id_combo = brawl_cafe.combo.id_combo)))
// ) A