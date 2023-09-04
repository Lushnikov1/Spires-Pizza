import { addCombo as add, createComboProduct, createSingleProduct, deletePositions, makeQuery, minusCombo, productExistsInCart, updateCartCount ,} from "../services/queryService.mjs"
import {body, validationResult,} from 'express-validator'
import tokenService from "../services/tokenService.mjs"
import userService from "../services/userService.mjs"
import jwt from 'jsonwebtoken'
import { beginTransaction, commit, connection, connection2, getConnection, getPool, rollback } from "../pool/pool.mjs"
import cartService from "../services/cartService.mjs"
class CartController{

    // no test 
    async addToCart(req,res,next){
        try {
            const {errors} = validationResult(req)
            if (errors.length){
                return res.status(500).send(errors.map(er => ({"error": er.msg})));
            }

            const access = req.headers?.authorization?.split(' ')[1]
            if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  
    
           const { userId} = jwt.verify(access, 'sh')
           const {
                ingridients,
                idCombo,
                content
            } = req.body

            await userService.userExists({userId})
    
            const singleProductHandler = async () =>{   
                const id = await  productExistsInCart({ingridients: ingridients, productId: content.id,userId: userId})
                id && await updateCartCount({cartId: id, count: 1})
                !id && await createSingleProduct({productId: content.id, userId: userId, ingridients})
            }

            const productProductHandler = async () =>{
                await createComboProduct({content, userId,comboId: idCombo})
            }
    
            const t =  ingridients => ({
                null: singleProductHandler,
                undefined: productProductHandler
                })[ingridients] || (singleProductHandler)
    
            await t(ingridients)()
            
            await cartService.updatePromo({userId});
            const cart = await userService.getCart({userId: userId})
            res.send(cart)
        } catch (error) {
            next(error)
        }
      
    }

    // no test 
    async addToCombo(req,res,next){
        try {
            const {errors} = validationResult(req)
            if (errors.length){
             return res.status(500).send(errors.map(er => ({"error": er.msg})));
            }
            res.send('Add Combo To cart') 
        } catch (error) {
            next(error)
        }
    
    }

    // no test 
    async cartDelete(req,res,next){
        try {
            const {errors} = validationResult(req);
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            const access = req.headers?.authorization?.split(' ')[1]
            if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  
    
            const {cartId, userId} = req.body
            try{
               await deletePositions({cartId, userId})
            } catch(err){
                return res.status(400).send(err.message);
            }
    
            res.send('Delete positions Combo from cart')
        } catch (error) {
            next(error)
        }
     
    }

    // tested 
    async cartGet(req,res,next){
        try {
            const {errors} = validationResult(req);
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            const access = req.headers?.authorization?.split(' ')[1]
            if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  
    
            const { userId} = jwt.verify(access, 'sh')
            await userService.userExists({userId}) 
           
            try{
               const cart =  await  userService.getCart({userId: userId})
               return res.send(cart)
            } catch(err)  {
                console.log(err)
                return  res.status(400).send(' ')
            }
        } catch (error) {
            next(error)
        }
       
    }

    // no test 
    async addProduct(req,res,next){
       

      try{ 
         const {errors} = validationResult(req);
        if (errors.length){
            return res.status(400).send(errors.map(er =>  er));
        }

        const access = req.headers?.authorization?.split(' ')[1]
        if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  

        const { userId} = jwt.verify(access, 'sh')

        const {
            cartId,
            comboCount,
            addedCount
        } = req.body

        console.log(req.body)

        await userService.userExists({userId}) 

        if (comboCount){
            const comboPositionsArray = [];
            const chunkSize = cartId.length/comboCount;
            for (let i = 0; i < cartId.length; i += chunkSize) {
                comboPositionsArray.push(cartId.slice(i, i + chunkSize))
            }

            console.log(comboPositionsArray)
            if (addedCount > 0) await add({count: addedCount, positions: comboPositionsArray[0]})
            else await minusCombo({positions: comboPositionsArray, count: addedCount})
            await cartService.updatePromo({userId})
            const cart = await userService.getCart({userId:userId})
            return res.send(cart)
        }
        try{
            await updateCartCount({cartId:cartId, count: addedCount})
            await cartService.updatePromo({userId})
            const cart = await userService.getCart({userId:userId})
            return res.send(cart)
        } catch(err){
            console.log(err)
            res.status(400).send({message: err.message, code: 400})
        }
        } catch(err){
            next(err)
        }
      
    }

    async addPromocode(req,res,next){
        try{ 
           const {errors} = validationResult(req);
          if (errors.length){
              return res.status(400).send(errors.map(er =>  er));
          }
  
          const access = req.headers?.authorization?.split(' ')[1]
          if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  
  
          const {userId} = jwt.verify(access, 'sh')
          const promocode = req.params.promocode
          console.log(promocode)
          await cartService.activatePromocode({promocode, userId})
  
     
          res.send('Промо-код')
       
          } catch(err){
              next(err)
          }
        
    }

    async clearPromocode(req,res, next){
        try{ 
           const {errors} = validationResult(req);
           if (errors.length){
               return res.status(400).send(errors.map(er =>  er));
           }
           const access = req.headers?.authorization?.split(' ')[1]
           if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  

           const {userId} = jwt.verify(access, 'sh')

           await cartService.clearPromo({userId})
      
           res.send('clear')

        } catch(err){
            next(err)
        }
    }

    async getPromo(req,res,next){
        try{
            const {errors} = validationResult(req);
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            const access = req.headers?.authorization?.split(' ')[1]
            if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  
            const {userId} = jwt.verify(access, 'sh')
      
            const promocode =  await cartService.updatePromo({userId})
            console.log(promocode, 10000)
            res.send(promocode)
        } catch(err){
            next(err)
        }

    }
}

export default new CartController()