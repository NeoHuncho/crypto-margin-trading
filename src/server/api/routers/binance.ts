import { Spot, type LotSizeFilter } from "@binance/connector";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { captureException } from "@sentry/nextjs";
import { decryptString } from "../utils/encryptDecryptString";

function calculateRemainingFunds(
  assetValue: number,
  liabilityValue: number,
  marginLevel: number,
) {
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
          Number(data.marginLevel),
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
      //! update to method in allUserCoins
      // if (input.coins) {
      //   const coins = input.coins;

      //   quantitiesToTrade = (
      //     await Promise.all(
      //       coins.map(async (coin) => {
      //         const {
      //           data: { amount },
      //         } = await client.marginMaxBorrowable(coin);
      //         return [
      //           coin,
      //           (parseFloat(amount) * input.percentage) / coins.length,
      //         ];
      //       }),
      //     )
      //   ).reduce((acc, curr) => {
      //     return { ...acc, [curr[0] as string]: curr[1] };
      //   }, {});
      // }
      if (input.allUserCoins) {
        const userCoins = await ctx.prisma.userCoin.findMany({
          where: {
            userId: input.userId,
          },
          select: {
            name: true,
          },
        });

        const { data } = await client.exchangeInfo({
          symbols: userCoins.map((coin) => `${coin.name}USDT`),
        });

        quantitiesToTrade = (
          await Promise.all(
            userCoins.map(async (coin) => {
              try {
                const {
                  data: { amount },
                } = await client.marginMaxBorrowable(coin.name);
                const amountToTrade =
                  (parseFloat(amount) * input.percentage) / userCoins.length;
                const coinData = data.symbols.find(
                  (d) => d.symbol === `${coin.name}USDT`,
                );
                if (coinData === undefined)
                  throw new Error(`coinData is null for coin ${coin.name}`);

                const LotSizeFilter = coinData.filters.find(
                  (f) => f.filterType === "LOT_SIZE",
                ) as LotSizeFilter;

                return [
                  coin.name,
                  Math.floor(
                    amountToTrade / parseFloat(LotSizeFilter.stepSize),
                  ) * parseFloat(LotSizeFilter.stepSize),
                ];
              } catch (error) {
                captureException(error, {
                  extra: {
                    message: "Binance actions error",
                  },
                });
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

      for (const [coin, quantity] of Object.entries(quantitiesToTrade)) {
        try {
          if (quantity > 0) {
            await client.marginBorrow(coin, quantity);
            const { data } = await client.newMarginOrder(
              `${coin}USDT`,
              "SELL",
              "MARKET",
              {
                quantity: quantity.toString(),
              },
            );

            const userCoin = await ctx.prisma.userCoin.findUnique({
              where: {
                userId: input.userId,
                name: coin,
              },
            });
            if (userCoin === null) {
              return;
            }

            await ctx.prisma.userCoin.update({
              where: {
                userId: input.userId,
                name: coin,
              },
              data: {
                investedCash:
                  userCoin.investedCash + Number(data.cummulativeQuoteQty),
                investedQuantity: quantity,
              },
            });
          }
        } catch (error) {
          captureException(error, {
            extra: {
              message: "Binance actions error",
            },
          });
        }
      }

      return quantitiesToTrade;
    }),
});
