import { z } from "zod";

export const currencySchema = z.enum(["btc", "eth", "usdt", "inr"]);
export type TCurrency = z.infer<typeof currencySchema>;

export const schema = z.object({
  cookie: z.string(),
  xAccessToken: z.string(),
  xLockDownToken: z.string(),
  realBalance: z.string(),
  virtualBalance: z.string(),
  initialBetAmount: z.string(),
  nextBetMultiplier: z.string(),
  stopAtCertainLossStreak: z.string(),
  conditon: z.enum(["above", "below", "switch"]),
  method: z.enum(["virtual", "real"]),
  currency: currencySchema,
  target: z.string(),
});
