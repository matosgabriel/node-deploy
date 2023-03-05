import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = fastify();
const prismaClient = new PrismaClient();

app.get('/users', async () => {
  const users = await prismaClient.user.findMany();

  return { users }
});

app.post('/users', async (request, reply) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email()
  })

  const { name, email } = createUserSchema.parse(request.body);

  await prismaClient.user.create({ data: { name, email } });

  return reply.status(201).send();
});

app.delete('/users', async (request, reply) => {
  const deleteUserSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteUserSchema.parse(request.query);

  const user = await prismaClient.user.findUnique({ where: { id } });

  if (!user) return reply.status(400).send({ error: 'Does not exists user with this id.' });

  await prismaClient.user.delete({ where: { id } });

  return reply.status(200).send();
});

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => console.log(`HTTP Server running at ${process.env.PORT || 3333}!`));