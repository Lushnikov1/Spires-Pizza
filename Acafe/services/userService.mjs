import { queries } from "../data/sqlQueries.mjs";
import { getPool } from "../pool/pool.mjs";
import { makeQuery } from "./queryService.mjs"

class UserService{
    async updateName({name, id}){
        await makeQuery("update Users set Users.user_name=? WHERE Users.id_user=?", [name, id],
                () =>{ throw new Error('Конец')}
         )
    }

    async updatePassword(){

    }

    async updatePhoneNumber(){
        
    }

    async getCart({userId}){
        try{  
            const result = await getPool().query(queries.getCart, [userId, userId]);
            return (
            result
            .map(elem => (
                {
                    ...elem,
                    idCart: JSON.parse(elem.idCart),
                    selectedIngrigients: JSON.parse(elem.selectedIngrigients),
                    existingIngridients: JSON.parse(elem.existingIngridients),
                    
                }
                )))
            
            
        } catch(err){throw err}
        
    }

    async userExists({userId}){
        try{
            const res = await makeQuery("SELECT DISTINCT id_user from users WHERE id_user=?", [userId])
            if (res.length) return true
            throw Error( "Юзера не существует")
            
        } catch(err){
            throw err
        }
       
    }
}

export default new UserService()