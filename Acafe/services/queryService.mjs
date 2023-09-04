import { escape } from "mysql"
import { queries } from "../data/sqlQueries.mjs"
import {connection,beginTransaction,rollback,commit, getPool, connection2, mainPool} from "../pool/pool.mjs"

import { sendMail } from "./emailService.mjs"
import { helpersService } from "./helpersService.mjs"
import UserDto from "./userDTO.mjs"

const  makeQuery = async (query, params, onError=()=>{}) =>{
    try{
        const resp = await connection.query(query, params)
        return resp
    }
    catch(err){
        console.log(err)
        onError(err)
    }
  
}

const deletePositions = async ({cartId, userId}) =>{
    try{
        const query = (cartId) => `DELETE FROM Cart WHERE id_cart in (${cartId.join(',')}) and id_users=?`
        makeQuery(query(cartId), [userId])
        
        return true;
    }catch(err) {throw err}   
}

const updateToken = async (id_user, newToken) =>{
    await makeQuery("UPDATE Users set Users.token=? WHERE id_user=?", [newToken, id_user])
    const [user] = await makeQuery("SELECT * FROM Users WHERE id_user=? ",  [id_user])
   
    return helpersService.userFormat(user)
}

const registrationUser = async (body) =>{
    const {
        user_name, 
        user_phone, user_email,
        user_login,user_password 
    } = body
    const [user] = await makeQuery("SELECT * FROM Users where user_login=?", [user_login])
    
    if (!user){
        const {insertId} = await makeQuery(
            "INSERT INTO `Users` ( `user_name`, `user_phone`, `user_email`, `user_login`, `user_password`) VALUES (?, ?, ?, ?, ?);",
            [user_name,user_phone,user_email,user_login, helpersService.hashPassword(user_password)]
        )
        await makeQuery("INSERT INTO `Activation` (`id_activation`, `id_user`, `activationLink`) VALUES (NULL, ?, ?)",
        [insertId, helpersService.createHash(insertId+user_name+user_email+user_email[0]+user_login)]
        )
        sendMail({
            text: "Регистрация пользователя  на ресурсе 'Spires'- код'"+('http://0.0.0.0:5010/user/activateAccount?h='+helpersService.createHash(insertId+user_name+user_email+user_email[0]+user_login)), 
            title:"Регистрация на ресурсе"
        })
        
        return true
    }
    return false
 
}

const ActivationAccount = async (tag) =>{
    try{
        const result = await makeQuery("update activation set activation.acrtivation_status=1 WHERE activationLink=?", [tag])
        return Boolean(result.changedRows)
    } catch(err){
        return false
    }
   
}

const checkUserExist = async (email, password) =>{
    console.log(email)
   const [user] =  await makeQuery("SELECT * FROM activeUsers where user_email=? and user_password=?", 
    [email,    helpersService.hashPassword(password)
   ])
   return user;
}

const updateCartCount = async ({cartId, count}) => {
    try {
        const [{changedRows}] = await connection2.query(
            `UPDATE Cart SET cart.product_count=cart.product_count+:count
            WHERE Cart.id_cart=:cartId
            AND cart.product_count+:count>0 
            `, {count, cartId});

        
        
        if (!changedRows) {
            await connection2.query(
                `DELETE FROM Cart    WHERE Cart.id_cart=:cartId `
                , {cartId});
        }
    } catch (error) {
        throw error
    }
  
}

const addCombo = async ({positions, count}) =>{
    const [cartPositions] = await makeQuery(`select  id_users,  id_productPrice, id_combo from Cart
    WHERE Cart.id_cart in (?)`, [positions.join(',')])

    const debug = await makeQuery(`select  id_users,  id_productPrice, id_combo from Cart
    WHERE Cart.id_cart in ?`, [[positions]])

    console.log(debug.map(e => [e.id_users, e.id_productPrice, e.id_combo]))
    // const {id_users, id_productPrice, id_combo} = cartPositions
    
    await beginTransaction();
    try{
    
        const res = await makeQuery("INSERT INTO ADD_cart(id_users, id_productPrice, id_combo) VALUES ?", 
                    [debug.map(e => [e.id_users, e.id_productPrice, e.id_combo]) ]
        )
    
        // await rollback()
        await commit()
    } catch(err){
        await rollback()
    }
    // транзакция

}

const minusCombo = async ({positions, count}) =>{
    console.log('chi')
    let  arr = []
    positions
    .map(posit => {
        if (arr.length < (-count)*positions[0].length ){
            arr = [...arr, ...posit]
        }
    })
    try{
        const t = arr.join(',')
        const {affectedRows} = await getPool().query(`DELETE FROM Cart 
            WHERE  Cart.id_cart in ( ? ) `,
            [arr]
        )
        if (!affectedRows) throw Error('Элементы не были найдены')
    } catch(err){
        throw err
    }
 
}

const productExistsInCart = async({userId, productId, ingridients}) => {
    const param1 =ingridients === null ? null : !null
    let sql = queries.getIngridientsCart;
    let ingrJoin = null;
    if (!param1){
        sql += ' and 1'
    } else{
        ingrJoin = ingridients.join(',')
        sql += ` and ingridients=?`
    }

    try{
        const [{id_cart}] = await getPool().query(sql, [userId, productId, param1, ingrJoin ])
        return id_cart
    } catch(err){
        return false
    }
    

   
}

const createSingleProduct = async ({userId, productId, ingridients}) =>{
    console.log(userId)
    console.log(productId)

   await  beginTransaction()
    try {
        const {insertId} = await  makeQuery("INSERT INTO `ADD_cart` (`id_addCart`, `id_users`, `id_productPrice`, `id_combo`) VALUES (NULL, ?, ?, NULL);",
            [userId, productId]
        )
        Array.isArray(ingridients) && 
        await ingridients
        .map(async e => {
            await makeQuery(`INSERT INTO Choosen_ingridients(id_addCart, id_ingridient) 
            VALUES (?, ?)`,   [insertId, e]   
            )
         }
        )
        

        // await rollback();
        await commit()
    } catch (error) {
       await  rollback()
        throw error
    }

}

const createComboProduct = async ({content, userId, comboId}) =>{
    let sql = `INSERT INTO ADD_cart(id_users, id_productPrice, id_combo) 
                VALUES ?`

    try{
        const {affectedRows} = await getPool().query(sql,  [
            content.map(commboElem => [userId, commboElem.id_productPrice, comboId])
       ] )
       if (affectedRows !== content.length || !affectedRows) throw new Error('Осуществлена некорректная вставка')
    } catch(err){
        throw err
    }
    
}

const ingridientsIsAccessed = async ({restaurantId, userId}) =>{
    const res = await makeQuery(queries.unaccessabilityIngridients, [restaurantId, userId, userId])
    if (res.length ){
        throw new Error('Ингридиент в списке исключения')
    }
}

const getCitiesDb = async () =>{
        const result = await makeQuery(`SELECT * FROM Cities WHERE 1`)
        return result
}

const  getIngridients = async () => {
    const connection2 = await mainPool.getConnection()
    const [result] = await connection2.query('SELECT id_ingridient as value, ingredient_name as label FROM `Ingredients` WHERE 1')
    connection2.release()
    return result
}

const createIngridient = async (name) => {
    const connection2 = await mainPool.getConnection()
    const [r] = await connection2.query("INSERT INTO `Ingredients` (`id_ingridient`, `ingredient_name`) VALUES (NULL, ?);", [name])
    console.log()
    connection2.release()
    return r.insertId
 
}

const productCreate = async (r) => {
    const {name, description, volumes, fileName, typeId, ingridients} = r
    const connection2 = await mainPool.getConnection()
    console.log(r)
    
    console.log('upload')
    await connection2.beginTransaction()
    try {
        const  [res] =await connection2.query("INSERT INTO `Products` (`id_product`, `id_productType`, `product_name`, `description`, `URL`) VALUES (NULL, ?, ?, ?, ?)",
        [null, name, description, fileName ])

       const id = (res.insertId)

       const res2 = await connection2.query("INSERT INTO `ProductPrices` (`id_productPrice`,  `volume`, `price`, `id_product`) VALUES ?",
       [
        [...volumes.map(e => [null, e.volume, e.price, id])]
       ])
    
       const res3 = await connection2.query("INSERT INTO `Products_ingridients` (`id_productIngridients`, `id_product`, `id_ingridient`, `added`) VALUES ?",
       [
        [...ingridients.map(e => [null, id,  e.idIngridient, e.addedPrice])]
       ])

    
 

       await  connection2.commit()
       connection2.release()

    } catch (error) {
        await connection2.rollback()

        throw new Error(error)
    }
}

export const COOKING_STATUSES = {
    WAITING_PAYMENT: 5,
    WAITING_SUCCESS: 1,
    IN_COOKING: 2,
    IN_DELIVERY: 3,
    READY_TO_GET: 4
}

export const getTypeOfOrder = async (orderId) => {
    const connection = await mainPool.getConnection()
    console.log('order id', orderId.length)
    
    const [query1] = await connection.query("SELECT * FROM Orders  WHERE id_order = ? ", [+orderId])

    console.log("................................................................")
    if (query1.length === 0) {
       return false
    }
    const order = query1[0]
    if (order['adress']) return {
        order: order,
        gettingType: 'delivery',
        isCart: order['payment_id'] !== null
    }
    connection.release()
    return  {
        order: order,
        gettingType: 'pickup',
        isCart: order['payment_id'] !== null
    }
}

export const getStatuses = async ({gettingType, isCart})=> {
    const connection = await mainPool.getConnection()
    
    const sql = `
        SELECT id_orderStatus as id, status_name as value
        FROM Order_status WHERE 1  
        ${gettingType === 'pickup' 
        ? " and  (type='P' OR type is null) " 
        : "and (type='D' or type is null)"}    
        ${isCart 
            ?  " "
            : ` and id_orderStatus not in (${COOKING_STATUSES.WAITING_PAYMENT})`
        }
        order by ordered asc
    `
    const [query1] = await connection.query(sql)
    return query1
}

export {
    productCreate,
    makeQuery,
    updateToken,
    registrationUser,
    ActivationAccount,
    checkUserExist,
    deletePositions,
    updateCartCount,
    addCombo,
    minusCombo,
    productExistsInCart,
    createSingleProduct,
    createComboProduct,
    ingridientsIsAccessed,
    getCitiesDb,
    getIngridients,
    createIngridient
}