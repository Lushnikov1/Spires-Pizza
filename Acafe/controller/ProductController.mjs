import { __dirname } from "../index.mjs";
import {productDTOArray } from "../services/productDTO.mjs";
import { createIngridient, getIngridients, makeQuery, productCreate } from "../services/queryService.mjs";
import { v4 as uuidv4 } from 'uuid';

class ProductController {
    // no test  
    async getMenu(req, res, next){
        try {
            let menu;
            if (req.query.city){
            
            }
            menu= await makeQuery("select * from menu")

            res.send(productDTOArray(menu))
        } catch (error) {
            next(error)
        }
      
    }

    // no test 
    async create(req, res, next){
        try {
            let menu;
            const image = req.files.image
           
            const name = req.body.title
            const description = req.body.description
            const volumes = JSON.parse(req.body.volumes)
            const typeId = 1
            const ingridients = JSON.parse(req.body.ingridients)
            console.log(ingridients)
            const file = req.files.image;

            const fileName = uuidv4()+file.name;
            const filePath = __dirname + '/image/' + fileName

            file.mv(filePath, (error) => {
                if (error) {
                  // Обработка ошибки при сохранении файла
                  return res.status(500).json({ error: 'File upload failed' });
                }})

            await productCreate({
                description,
                fileName,
                name,
                volumes,
                typeId,
                ingridients
            })
            // Сохранение файла на сервере
            
              
            res.send('Create')
        } catch (error) {
            next(error)
        }
 
    }

    async getIngridients(req, res, next){
        const ingridients = await getIngridients()
        res.send(ingridients)
    }

    async createIngridients(req, res, next){
        const lastId = await createIngridient(req.body?.name)
        res.send({
            label: req.body?.name,
            value: lastId,
        })
    }

}

export default new ProductController()