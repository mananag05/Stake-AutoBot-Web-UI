import { TCurrency } from "@/Schemas";
import localforage from "localforage";
import toast from "react-hot-toast";

interface IDiceGameHeadersData {
  cookie: string;
  xAccessToken: string;
  xLockDownToken: string;
}

interface IDiceGameAccountData {
  virtualBalance: string;
  realBalance: string;
  initialBetAmount: string;
  nextBetMultiplier: string;
  stopAtCertainLossStreak: string;
  conditon: "above" | "below" | "switch";
  target: string;
  currency: TCurrency;
  method : "virtual" | "real";
}

const handleSaveHeadersData = ({
  cookie,
  xAccessToken,
  xLockDownToken,
}: IDiceGameHeadersData) => {
  localforage.setItem("diceGameHeadersData", {
    cookie: cookie,
    xAccessToken: xAccessToken,
    xLockDownToken: xLockDownToken,
  });
  toast.success("Updated Successfully");
};

const handleSaveAccountData = ({
  virtualBalance,
  realBalance,
  initialBetAmount,
  nextBetMultiplier,
  stopAtCertainLossStreak,
  conditon,
  target,
  currency,
  method
}: IDiceGameAccountData) => {
  localforage.setItem("diceGameAccountData", {
    virtualBalance: virtualBalance,
    realBalance: realBalance,
    initialBetAmount: initialBetAmount,
    nextBetMultiplier: nextBetMultiplier,
    stopAtCertainLossStreak: stopAtCertainLossStreak,
    conditon: conditon,
    target: target,
    currency : currency,
    method : method
  });
  toast.success("Updated Successfully");
};

export {
  handleSaveHeadersData,
  handleSaveAccountData,
  IDiceGameAccountData,
  IDiceGameHeadersData,
};
