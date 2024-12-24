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
  method: "virtual" | "real";
  stopAtVirtualBalnce: string;
  enableChunksBetting?: boolean;
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

const handleSaveAccountData = async ({
  virtualBalance,
  realBalance,
  initialBetAmount,
  nextBetMultiplier,
  stopAtCertainLossStreak,
  conditon,
  target,
  currency,
  method,
  stopAtVirtualBalnce,
}: IDiceGameAccountData) => {
  const existingData = await localforage.getItem<IDiceGameAccountData>("diceGameAccountData");
  const updatedData = {
    ...existingData,
    virtualBalance,
    realBalance,
    initialBetAmount,
    nextBetMultiplier,
    stopAtCertainLossStreak,
    conditon,
    target,
    currency,
    method,
    stopAtVirtualBalnce,
  }
  await localforage.setItem("diceGameAccountData", updatedData);
  toast.success("Updated Successfully");
};

const handleUpdateEnableChunksBetting = async (enableChunksBetting: boolean) => {
  try {
    const existingData = await localforage.getItem<IDiceGameAccountData>("diceGameAccountData");
    const updatedData = {
      ...existingData,
      enableChunksBetting,
    };
    await localforage.setItem("diceGameAccountData", updatedData);
    toast.success("Updated Successfully");
  } catch (error) {
    toast.error("Failed to update enableChunksBetting");
    console.error(error);
  }
};

export {
  handleSaveHeadersData,
  handleSaveAccountData,
  handleUpdateEnableChunksBetting,
  IDiceGameAccountData,
  IDiceGameHeadersData,
};
