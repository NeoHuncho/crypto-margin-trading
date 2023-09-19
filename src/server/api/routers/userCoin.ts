import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userCoinRouter = createTRPCRouter({
  recordBorrowAction: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        quantity: z.number(),
        coin: z.string(),
        cost: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userCoin = await ctx.prisma.userCoin.findUnique({
        where: {
          userId: input.userId,
          name: input.coin,
        },
      });
      if (!userCoin) {
        throw new Error("User coin not found");
      }
      const updatedUserCoin = await ctx.prisma.userCoin.update({
        where: {
          userId: input.userId,
          name: input.coin,
        },
        data: {
          investedCash: userCoin.investedCash + input.cost,
          investedQuantity: userCoin.investedQuantity + input.quantity,
        },
      });
      return updatedUserCoin;
    }),
  recordRepayAction: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        quantity: z.number(),
        coin: z.string(),
        cost: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userCoin = await ctx.prisma.userCoin.findUnique({
        where: {
          userId: input.userId,
          name: input.coin,
        },
      });
      if (!userCoin) {
        throw new Error("User coin not found");
      }

      const priceDifference =
        userCoin.investedCash / userCoin.investedQuantity -
        input.cost / input.quantity;
      const profitLoss = priceDifference * input.quantity;
      const updatedUserCoin = await ctx.prisma.userCoin.update({
        where: {
          userId: input.userId,
          name: input.coin,
        },
        data: {
          investedCash: userCoin.investedCash - input.cost,
          investedQuantity: userCoin.investedQuantity - input.quantity,
          soldCash: userCoin.soldCash + input.cost,
          soldQuantity: userCoin.soldQuantity + input.quantity,
          profitLoss: userCoin.profitLoss + profitLoss,
        },
      });
      return updatedUserCoin;
    }),
});
