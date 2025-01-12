import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { AuthorRouter } from './routes/author';
import { profileRouter } from './routes/profiles';
import { UserRouter } from './routes/user';



const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
    JWT_SECRET:string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}>();



app.use('/*',cors({
  origin: ['http://localhost:5173'], 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders:['content-length'],
  maxAge:600,
  credentials:true
}))


app.route("/author",AuthorRouter);
app.route("/user", UserRouter)
app.route("/profile", profileRouter)



export default app;