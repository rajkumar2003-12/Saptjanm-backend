
import { Hono } from "hono";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { verify } from "hono/jwt";
import { ProfileCreateUpdate } from "../utils/zodValid";

export const profileRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        SECRETE_KEY:string
      },
      Variables:{
        userId:string;
    }
}>();



profileRouter.use("/*", async(c, next)=>{
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

profileRouter.post("/create", async(c)=>{
  try{
    const body=await c.req.json();
    const validationZod = ProfileCreateUpdate.safeParse(body);

    if(!validationZod.success){
      c.status(411);
      return c.json({
          message: "Inputs not correct",
          errors: validationZod.error.format(),
      })
    }
    const userId=c.get("userId")

    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const user = await prisma.user.findUnique({
        where:{
            id:Number(userId)
        }
    })
    if(!user){
        c.status(404);
        return c.json({error:"you are not authorised person for creating your profile"})
    }
    const profile = await prisma.profile.create({
        data:{
            ...validationZod.data,
            userId:Number(userId),
        }
    })
    console.log("profile_details",profile)
    return c.json({
        profile
      })
  } catch(err){
    return c.json({err},500)
  }
})

profileRouter.put("/update",async(c)=>{
  try{
    const body = await c.req.json();
    const userId = c.get("userId")
    const validationZod = ProfileCreateUpdate.safeParse(body);

    if(!validationZod.success){
      c.status(411);
      return c.json({
          message: "Inputs not correct",
          errors: validationZod.error.format(),
      })
    }

    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const profile = await prisma.profile.update({
        where:{
          userId:Number(userId)
        },
        data:{
          ...validationZod.data
        }
    })
    return c.json({
      id:profile.id
    })

  }catch(err){
    return c.json({err},500)
  }

})

profileRouter.get("/filter", async(c)=>{

  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");
  const userProfile = await prisma.profile.findUnique({
    where: { userId: Number(userId) },
  });

  if (!userProfile) {
    return c.json({ message: "User profile not found" }, 404);
  }

  const filters: any = {};
  filters.gender = userProfile.gender === "Male" ? "Female" : "Male";
  filters.religion = userProfile.religion;
  filters.maritalStatus = userProfile.maritalStatus;

  const profiles= await prisma.profile.findMany({
    where:filters,
    select:{
      id:true,
      name:true,
      gender:true,
      religion:true,
      location:true,
      maritalStatus:true,
      education:true,
      occupation:true,
      createdAt:true
    }
  });

  return c.json({
    profiles
  })

})

profileRouter.get("/details", async(c)=>{
  const userId = c.get("userId")
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,

  }).$extends(withAccelerate())

  const profiles= await prisma.profile.findUnique({

    where:{
      userId:Number(userId)
    },
    select:{
      id:true,
      name:true,
      gender:true,
      religion:true,
      location:true,
      maritalStatus:true,
      education:true,
      occupation:true,
      createdAt:true
    }
  });
  console.log("profile details",profiles)

  return c.json({
    profiles
  })

})


profileRouter.get("/", async (c) => {
  const userId = c.get("userId");
  console.log("userId from context:", userId); 

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const profile = await prisma.profile.findUnique
    ({
      where: {
        userId: Number(userId)
      },
      select: {
        id:true,
        name: true,
        gender: true,
        religion: true,
        location: true,
        maritalStatus: true,
        education: true,
        occupation: true,
        createdAt: true,
      },
    });

    console.log("Profile result:", profile); 

    if (!profile) {
      return c.json({ message: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error:any) {
    console.error("Error in /get-profile:", error); 
    return c.json({ message: "An unexpected error occurred", error: error.message}, 500);
  }
});