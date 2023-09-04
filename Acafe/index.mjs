import cookieParser from 'cookie-parser';
import express from 'express';
import fileUpload from 'express-fileupload';
import CartRouter from './routes/CartRouter.mjs';
import ProductRouter from './routes/ProductRouter.mjs';
import UserRouter from './routes/UserRouter.mjs';
import cors from 'cors'
import ErrorHandler from './middlewares/UserIdHandler.mjs';
import dotenv from 'dotenv'
import OrderRouter from './routes/Order.router.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config({path: './.env'})

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
console.log('Корневая папка - ',__dirname)

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000",

})) 

app.use(fileUpload({
  createParentPath: true
}));


app.get('/', (req, res)=> res.send('21'));

app.use('/product', ProductRouter)
app.use('/cart', CartRouter)
app.use('/user', UserRouter)
app.use('/order', OrderRouter)
app.get('/image/:name', (req,res) =>{
  console.log(req.params.name)
  res.sendFile(`${__dirname}/image/${req.params.name}`)
})
const { SERVER_PORT: port = 5010 } = process.env;


app.listen({ port }, () => {
  console.log(`🚀 Server ready at http://0.0.0.0:${port}`);
});

app.use(ErrorHandler)

