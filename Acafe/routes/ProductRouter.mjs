import { Router } from "express";
import ProductController from "../controller/ProductController.mjs";


const  ProductRouter = Router();

ProductRouter.get('/getMenu', ProductController.getMenu)

ProductRouter.post('/create', ProductController.create)

ProductRouter.get('/ingridients', ProductController.getIngridients)

ProductRouter.put('/ingridients', 

ProductController.createIngridients)


export default ProductRouter