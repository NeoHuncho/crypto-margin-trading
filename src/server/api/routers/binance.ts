import { Spot } from '@binance/connector';
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { decryptString } from '../utils/encryptDecryptString';


function calculateRemainingFunds(assetValue:number, liabilityValue:number) {
    const marginLevel = liabilityValue? assetValue / liabilityValue:999;

    if (marginLevel <= 1.5) {
      return 0; // Already above or equal to 1.5, no funds needed
    } else {
      const targetMarginLevel = 1.5;
      const remainingFunds = (assetValue * targetMarginLevel) - liabilityValue;
      return remainingFunds
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
            if(user.exchangeName !== 'binance'){
                throw new Error("User exchange is not binance");
            }
            if(!user.exchangeApiKey || !user.exchangeApiSecret){
                throw new Error("User exchange api key or secret is not set");
            }
            const client = new Spot(user.exchangeApiKey, decryptString(user.exchangeApiSecret));
            const {data}= await client.marginAccount();      
            return {
                amountLeftToTradeBtc: calculateRemainingFunds(Number(data.totalNetAssetOfBtc), Number(data.totalLiabilityOfBtc)),
                ...data,
            }
            
        }
        ),
    getCurrentBTCPrice: publicProcedure
        .query(async () => {
            const client = new Spot();
            const {data}= await client.avgPrice('BTCUSDT');
    
            return data;
        }
        ),

    
    
});

