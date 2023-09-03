import crypto from 'crypto';
import { z } from 'zod';
import { env } from '~/env.mjs';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';


function encryptSecretKey(text: string) {
    const IV_LENGTH = 16; // For AES, this is always 16
    const iv = crypto.randomBytes(IV_LENGTH);
    console.log(111,env.ENCRYPTION_KEY)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(env.ENCRYPTION_KEY,'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');  
}


export const userRouter = createTRPCRouter({
  getUserExchangeName: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          exchangeName: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),
  updateUserExchangeData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        exchangeName: z.enum(['binance']),
        exchangeApiKey: z.string(),
        exchangeApiSecret: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const encryptedKey=  encryptSecretKey(input.exchangeApiSecret);
      console.log(123,encryptedKey);
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          exchangeName: input.exchangeName,
          exchangeApiKey: input.exchangeApiKey,
          exchangeApiSecret: encryptSecretKey(input.exchangeApiSecret),
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }
    ),
});
