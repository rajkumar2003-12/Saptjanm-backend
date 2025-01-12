import { Hono } from 'hono';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client/edge';
import { sign } from 'hono/jwt';
import { SignupUpdate, Signinput } from '../utils/zodValid';


export const AuthorRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRETE_KEY: string;
  };
  Variables: {
    userId: string;
  };
}>();

AuthorRouter.post('/signup', async (c) => {
  const body = await c.req.json();

  const { success } = SignupUpdate.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: 'Inputs not correct' });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: body.password,
      },
    });

    const jwt = await sign({id: user.id,},c.env.SECRETE_KEY);

    return c.json({ id: user.id, token: jwt });
  } catch (e) {
    c.status(500);
    return c.text('Error creating user');
  }
});

AuthorRouter.post('/signin', async (c) => {
  const body = await c.req.json();

  const { success } = Signinput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: 'Inputs not correct' });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: 'User not found' });
    }

    const jwt = await sign({id: user.id,},c.env.SECRETE_KEY);

    return c.json({ user, token: jwt });
  } catch (e) {
    c.status(500);
    return c.text('Error signing in');
  }
});


