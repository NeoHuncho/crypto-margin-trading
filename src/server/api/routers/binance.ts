import { Spot } from "@binance/connector";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { decryptString } from "../utils/encryptDecryptString";

function calculateRemainingFunds(assetValue: number, liabilityValue: number) {
  const marginLevel = liabilityValue ? assetValue / liabilityValue : 999;

  if (marginLevel <= 1.5) {
    return 0;
  } else {
    const targetMarginLevel = 1.5;
    const remainingFunds = assetValue * targetMarginLevel - liabilityValue;
    return remainingFunds;
  }
}

export const binanceRouter = createTRPCRouter({
  getBinanceAccountInformation: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          exchangeName: true,
          exchangeApiKey: true,
          exchangeApiSecret: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }
      if (user.exchangeName !== "binance") {
        throw new Error("User exchange is not binance");
      }
      if (!user.exchangeApiKey || !user.exchangeApiSecret) {
        throw new Error("User exchange api key or secret is not set");
      }
      const client = new Spot(
        user.exchangeApiKey,
        decryptString(user.exchangeApiSecret),
      );
      const { data } = await client.marginAccount();
      return {
        amountLeftToTradeBtc: calculateRemainingFunds(
          Number(data.totalNetAssetOfBtc),
          Number(data.totalLiabilityOfBtc),
        ),
        ...data,
      };
    }),
  getCurrentBTCPrice: publicProcedure.query(async () => {
    const client = new Spot();
    const { data } = await client.avgPrice("BTCUSDT");

    return data;
  }),
  buySellMarginCoinsPercentage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        //coins is an array of strings
        coins: z.array(z.string()).optional(),
        percentage: z.number(),
        allUserCoins: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          exchangeApiKey: true,
          exchangeApiSecret: true,
        },
      });
      if (!user?.exchangeApiKey || !user.exchangeApiSecret) {
        throw new Error("User not found");
      }
      const client = new Spot(
        user.exchangeApiKey,
        decryptString(user.exchangeApiSecret),
      );

      //either null or an object with the coin name as the key and the quantity to trade as the value
      let quantitiesToTrade: Record<string, number> | null = null;
      if (!input.coins && !input.allUserCoins) {
        throw new Error("Either coins or allUserCoins must be set");
      }
      if (input.coins) {
        const coins = input.coins;

        quantitiesToTrade = (
          await Promise.all(
            coins.map(async (coin) => {
              const {
                data: { amount },
              } = await client.marginMaxBorrowable(coin);
              return [
                coin,
                (parseFloat(amount) * input.percentage) / coins.length,
              ];
            }),
          )
        ).reduce((acc, curr) => {
          return { ...acc, [curr[0] as string]: curr[1] };
        }, {});
      }
      if (input.allUserCoins) {
        const userCoins = await ctx.prisma.userCoin.findMany({
          where: {
            userId: input.userId,
          },
          select: {
            name: true,
          },
        });

        quantitiesToTrade = (
          await Promise.all(
            userCoins.map(async (coin) => {
              try {
                const {
                  data: { amount },
                } = await client.marginMaxBorrowable(coin.name);
                return [
                  coin.name,
                  (parseFloat(amount) * input.percentage) / userCoins.length,
                ];
              } catch (error) {
                return [coin.name, 0];
              }
            }),
          )
        ).reduce((acc, curr) => {
          return { ...acc, [curr[0] as string]: curr[1] };
        }, {});
      }
      if (!quantitiesToTrade) {
        throw new Error("quantitiesToTrade is null");
      }
      return quantitiesToTrade;
    }),
});
