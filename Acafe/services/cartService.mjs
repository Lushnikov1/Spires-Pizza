import { promocodes } from '../data/promocodes.mjs'
import { beginTransaction, commit,  mainPool, rollback,  } from '../pool/pool.mjs'
import {makeQuery} from '../services/queryService.mjs'


class CartService{
    async clearPromo({userId}){
        const connection2 = await mainPool.getConnection()
        connection2.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
              if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
              }
              return txt;
            }.bind(this));
        };
        await connection2.beginTransaction()
        try{
            await connection2.query(`update cart set cart.product_price=(SELECT price  FROM Cart_old_prices WHERE Cart_old_prices.id_cart=cart.id_cart)
            where cart.id_cart in (
            SELECT Cart_old_prices.id_cart FROM Cart_old_prices) and id_users=:userId`, {userId})
            
            const sql = `DELETE FROM Cart_old_prices
            WHERE Cart_old_prices.id_cart_oldPrice IN (
            select * from(
                    SELECT Cart_old_prices.id_cart_oldPrice FROM Cart
                    left join Cart_old_prices on cart.id_cart=Cart_old_prices.id_cart
                    where Cart.id_users=:userId
            )A
            )`

            // удаление промокода

            const test = await connection2.query(sql, {userId});   
            

            await connection2.query(`
                DELETE FROM Users_promocode
                WHERE id_user=:userId
            `, {userId})
            

            await connection2.query(`
                 INSERT INTO DROPTABLE(T) VALUES (1231312)
            `)
            

             await connection2.commit()
           
        } catch(err){
             await connection2.rollback()
            throw err
        } 
        connection2.release()


    }

    async activatePromocode({promocode, userId}){
        const connection = await mainPool.getConnection()
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
              if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
              }
              return txt;
            }.bind(this));
        };
      
        try{
            await connection.beginTransaction()
            await this.clearPromo({userId})
            const sql = promocodes?.[promocode]?.sql
            if (!sql)  throw new Error('Промокода не существует')

            const insertedOldPrices = await connection.query(`INSERT INTO Cart_old_prices( id_cart, price)
            SELECT Cart.id_cart, Cart.product_price FROM Cart where id_users=:userId 
            `, {userId})

            const promocodeResult = await connection.query(sql, {userId})

            const insert = await connection.query(`
            INSERT INTO Users_promocode( promocode, id_user) 
            VALUES (:promo, :user)  
            `, {promo: promocode, user: userId})


            await connection.commit()

            return promocode
            // const result = await connection2.query(sql, {userId: userId, promo:promocode});
            // if (result.affectedRows === 0) throw new Error(promocodes[promocode].onErrorMessage)
        } catch(err){
            console.log(err)
            await connection.rollback()
            throw err
        }    finally{
           connection.release()
        }
    }

    async updatePromo({userId}){ 
        try {
            const [req] = await makeQuery('SELECT promocode FROM `Users_promocode` WHERE id_user=?', [userId])
            const promocode = req?.promocode
           

            if (promocode){
               const promo = await this.activatePromocode({promocode, userId})
               return  promo
            }
            return null
        } catch (error) {
            console.log('ОШИБКА')
            throw error
        }
       
    }
    
}

export default new CartService()