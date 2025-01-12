
import { Hono } from "hono";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { verify } from "hono/jwt";
import { SignupUpdate } from "../utils/zodValid";


export const UserRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        SECRETE_KEY:string
      },
      Variables:{
        userId:string;
    }
}>();


UserRouter.use("/*", async(c, next)=>{
  console.log("Headers:", c.req.header);
  const authHeader = c.req.header("Authorization");
  console.log(authHeader);

  if (!authHeader) {
    c.status(404);
    return c.json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  console.log("token:", token);

    try{
      const user=await verify(token, c.env.SECRETE_KEY);
      console.log(user)

      if(user){
          console.log("Decoded User:", user);
          c.set("userId",String(user.id));
          await next();
      }else{
          c.status(403);
          return c.json({
              message:"You are not logged in"
          })
      }
    }catch(e){
      console.error("JWT verification failed:", e); 
      c.status(403);
      return c.json({
          message:e
      })
    }
})


UserRouter.put('/update', async(c)=>{
  const body = await c.req.json();
  const userId = c.get("userId")
  const validationZod = SignupUpdate.safeParse(body);
  console.log(validationZod)

  if(!validationZod.success){
    c.status(404);
    return c.json({
        message: "Inputs not correct",
    })
  }

  const prisma =new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  try{
    const user= await prisma.user.update({
      where:{
        id:Number(userId)
      },
      data:{
        ...validationZod.data
      }
    })

    return c.json({
      id:user
    })
  }catch(e){
    c.status(411);
    return c.text('Invalid')
  }
  
})

UserRouter.get("/details", async(c)=>{
  try{
  const userId = c.get("userId")

  const prisma =new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const user_details = await prisma.user.findMany({
    where:{
      id:Number(userId)
    },
    select:{
      username:true,
      email:true
    }
  })
  if(!user_details){
    c.status(404)
    return c.json({error:"you are not a authorised person"})
  }
  return c.json({user_details})
}catch(error){
  c.status(404)
  return c.json({error:error})
}
})
