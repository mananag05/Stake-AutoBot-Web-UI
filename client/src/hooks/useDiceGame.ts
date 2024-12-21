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
      condition,
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
          condition: condition,
          identifier: "Lv1A3P2T4u41Uuf3ucUpC",
          amount: amountToBet,
          currency: currency,
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

export function getRandomTimeOut() {
  return Math.floor(Math.random() * (400 - 200 + 1)) + 400;
}

export const createGetConstraints = () => {
  let lastCondition: "above" | "below" | null = null;

  return ({
    condition,
    target,
  }: {
    condition: "above" | "below" | "switch";
    target: number;
  }): { condition: "above" | "below"; target: number } => {
    if (condition === "switch") {
      const nextCondition = lastCondition === "above" ? "below" : "above";
      lastCondition = nextCondition;
      return {
        condition: nextCondition,
        target: nextCondition === "above" ? target : 100 - target,
      };
    }
    return {
      condition,
      target,
    };
  };
};