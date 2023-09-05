import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { encryptString } from '../utils/encryptDecryptString';





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
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          exchangeName: input.exchangeName,
          exchangeApiKey: input.exchangeApiKey,
          exchangeApiSecret: encryptString(input.exchangeApiSecret),
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }
    ),
    getUserStats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const stats= await ctx.prisma.userStats.findFirst({
        where: { userId: input.userId },
      })
      if (!stats) {
        throw new Error('User stats not found');
      }
      return stats;
    }),
    createUserStats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const stats = await ctx.prisma.userStats.create({
        data:{
          userId: input.userId,
        }
      })
      if (!stats) {
        throw new Error('User stats not found');
      }
      return stats;
    }),
});
