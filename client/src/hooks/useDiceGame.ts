import { useMutation } from "@tanstack/react-query";
import { diceQuery } from "../constants/diceGameConstants";
import toast from "react-hot-toast";
interface IDiceGame {
  cookie: string;
  xAccessToken: string;
  xLockDownToken: string;
  target: number;
  condition: "above" | "below";
  amountToBet: number;
  currency: string;
}

export function useDiceGame() {
  return useMutation({
    mutationFn: async ({
      cookie,
      xAccessToken,
      xLockDownToken,
      target,
      amountToBet = 0,
      currency = "inr",
    }: IDiceGame) => {
      const myHeaders = new Headers();
      myHeaders.append("Cookie", cookie);
      myHeaders.append("x-access-token", xAccessToken);
      myHeaders.append("x-lockdown-token", xLockDownToken);
      myHeaders.append("Content-Type", "application/json");
      const raw = JSON.stringify({
        query: diceQuery,
        variables: {
          target: target,
          condition: "above",
          identifier: "Lv1A3P2T4u41Uuf3ucUpC",
          amount: amountToBet,
          currency: "inr",
        },
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetch(
        "https://stake.com/_api/graphql",
        requestOptions as any
      );
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        throw new Error(`Error: ${result.message || "Unknown error"}`);
      }
    },
    onSuccess : (data) => {
        console.log('placed')
    }
  });
}