import { Spot } from '@binance/connector';
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import { decryptString } from '../utils/encryptDecryptString';




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
            return data;
            
        }
        ),
    
    
});

