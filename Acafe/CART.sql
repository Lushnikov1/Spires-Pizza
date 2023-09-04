SELECT 
   id_cart collate utf8mb4_general_ci  as idCart, 
   id_combo as idCombo,
    name,
    cartview.url, 
    id_productPrice as idProductPrice, 
    product_price as productPrice,
    product_count as count, 
	selected_ingridients as selectedIngrigients,
    existingIngridients 
FROM `cartview`
WHERE id_users=22
UNION 
SELECT CONCAT('[',id, ']') , id_combo, combo_name, url, null, unit_price, count,null, null FROM (
    select `brawl_cafe`.`combo`.`id_combo` 
    AS `id_combo`,`brawl_cafe`.`combo`.`combo_name` 
    AS `combo_name`,`a2`.`dt` AS `dt2`,
    (select (`brawl_cafe`.`combo`.`default_price` + sum(`brawl_cafe`.`combo_position`.`added`)) 
    from `brawl_cafe`.`combo_position` where ((`brawl_cafe`.`combo_position`.`id_combo` = `brawl_cafe`.`combo`.`id_combo`) 
    and `brawl_cafe`.`combo_position`.`id_productPrice` in 
    (select distinct `brawl_cafe`.`cart`.`id_productPrice` from `brawl_cafe`.`cart` where (`brawl_cafe`.`cart`.`dt` = `dt2`)))) AS `unit_item`,(select sum(`brawl_cafe`.`cart`.`product_price`) 
    from `brawl_cafe`.`cart` where (`brawl_cafe`.`cart`.`dt` = `dt2`)) AS `unit_price`,`a2`.`TESDF` AS `id`,
    (select group_concat(`brawl_cafe`.`products`.`product_name`,' ',`brawl_cafe`.`productprices`.`volume` separator ',') from ((`brawl_cafe`.`productprices` 
    join `brawl_cafe`.`products` on((`brawl_cafe`.`products`.`id_product` = `brawl_cafe`.`productprices`.`id_product`))) join `brawl_cafe`.`cart` 
    on((`brawl_cafe`.`cart`.`id_productPrice` = `brawl_cafe`.`productprices`.`id_productPrice`))) where ((`brawl_cafe`.`cart`.`id_combo` is not null) 
    and `brawl_cafe`.`productprices`.`id_productPrice` in (select `brawl_cafe`.`cart`.`id_productPrice` from `brawl_cafe`.`cart` where (`brawl_cafe`.`cart`.`dt` = `dt2`)))) 
    AS `Content`,`brawl_cafe`.`combo`.`URL` AS `url`,`a2`.`count` AS `count` from (`brawl_cafe`.`combo` join (select `a1`.`id_combo` AS `id_combo`,count(0) 
    AS `count`,substring_index(group_concat(`a1`.`dt` separator ','),',',1) AS `dt`,group_concat(`a1`.`crtID` separator ',') AS `TESDF`,group_concat(`a1`.`crtID` separator ',') 
    AS `fd` from (select `brawl_cafe`.`cart`.`id_combo` AS `id_combo`,`brawl_cafe`.`cart`.`dt` AS `dt`,group_concat(distinct `brawl_cafe`.`cart`.`id_productPrice` 
    order by `brawl_cafe`.`cart`.`id_productPrice` ASC separator ',') AS `content`,group_concat(`brawl_cafe`.`cart`.`id_cart` separator ',') AS `crtID` 
    from `brawl_cafe`.`cart` where ((`brawl_cafe`.`cart`.`id_users` = 22) and (`brawl_cafe`.`cart`.`id_combo` is not null)) 
    group by `brawl_cafe`.`cart`.`id_combo`,`brawl_cafe`.`cart`.`dt`,`brawl_cafe`.`cart`.`id_users`) `A1` 
    group by `a1`.`id_combo`,`a1`.`content`) `A2` on((`a2`.`id_combo` = `brawl_cafe`.`combo`.`id_combo`)))
) A

-- utf8mb4_general_ci