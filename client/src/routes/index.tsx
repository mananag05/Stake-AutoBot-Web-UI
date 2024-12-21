import { createFileRoute } from "@tanstack/react-router";
import useForm from "../hooks/useForm";
import { z } from "zod";
import { useDiceGame } from "../hooks/useDiceGame";
import localforage from "../src/utils/localForage";
import { useEffect } from "react";
import toast from "react-hot-toast";
export const Route = createFileRoute("/")({
  component: RouteComponent,
});
import styles from "../styles/hide-scrollbar.module.scss";
import { twMerge } from "tailwind-merge";

type DiceGameHeadersData = {
  cookie: string;
  xAccessToken: string;
  xLockDownToken: string;
};

type DiceGameAccountData = {
  balance: string;
  initialBetAmount: string;
  nextBetMultiplier: string;
  stopAtCertainLossStreak: string;
};

function RouteComponent() {
  const { mutateAsync } = useDiceGame();
  const numRegex = /^\d+(\.\d+)?$/;

  const { values, setFiledValue } = useForm([], schema, {
    cookie: "",
    xAccessToken: "",
    xLockDownToken: "",
    balance: '10',
    initialBetAmount: '0.01',
    nextBetMultiplier: '2',
    stopAtCertainLossStreak: '5',
  });

  const handleSaveHeadersData = () => {
    localforage.setItem("diceGameHeadersData", {
      cookie: values.cookie,
      xAccessToken: values.xAccessToken,
      xLockDownToken: values.xLockDownToken,
    });
    toast.success("Updated Successfully");
  };

  const handleSaveAccountData = () => {
    localforage.setItem("diceGameAccountData", {
      balance: values.balance,
      initialBetAmount: values.initialBetAmount,
      nextBetMultiplier: values.nextBetMultiplier,
      stopAtCertainLossStreak: values.stopAtCertainLossStreak,
    });
    toast.success("Updated Successfully");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await localforage.getItem<DiceGameHeadersData>(
          "diceGameHeadersData"
        );
        const accountData = await localforage.getItem<DiceGameAccountData>(
          "diceGameAccountData"
        );
        if (data) {
          setFiledValue("cookie", data.cookie);
          setFiledValue("xAccessToken", data.xAccessToken);
          setFiledValue("xLockDownToken", data.xLockDownToken);
        }
        if (accountData) {
          setFiledValue("balance", accountData.balance);
          setFiledValue("initialBetAmount", accountData.initialBetAmount);
          setFiledValue("nextBetMultiplier", accountData.nextBetMultiplier);
          setFiledValue(
            "stopAtCertainLossStreak",
            accountData.stopAtCertainLossStreak
          );
        }
      } catch (error) {
        console.error("Error fetching data from localforage:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-primarybg h-full p-2">
      <div className=" bg-[#595959] flex flex-col h-full w-full rounded-md">
        <p className="p-2 text-yellow-100 font-mono font-semibold">
          Stake Auto Gambling bot web ui
        </p>
        <div className="flex flex-1 overflow-hidden">
          <div
            className={twMerge(
              `flex flex-col max-w-96 overflow-y-auto gap-3 -ml-2 bg-neutral-700 rounded-se-2xl`,
              styles["hide-scrollbar"]
            )}
          >
            <div className="p-2 flex flex-col gap-2 bg-neutral-800 rounded-xl m-2">
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">Cookie*</p>
                <textarea
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) => setFiledValue("cookie", e.target.value)}
                  value={values.cookie}
                  rows={3}
                />
              </div>
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">xAccessToken*</p>
                <input
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("xAccessToken", e.target.value)
                  }
                  value={values.xAccessToken}
                />
              </div>
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">xLockDownToken*</p>
                <input
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("xLockDownToken", e.target.value)
                  }
                  value={values.xLockDownToken}
                />
              </div>
              <button
                onClick={handleSaveHeadersData}
                className="bg-green-500 w-full text-center p-2 rounded-xl mt-2"
              >
                Save
              </button>
            </div>
            <div className="p-2 flex flex-col gap-2 bg-neutral-800 rounded-xl m-2">
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">Set Balance</p>
                <input
                  type="number"
                  min={0}
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("balance",e.target.value)
                  }
                  value={values.balance}
                />
              </div>
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">Set Initial Bet</p>
                <input
                  type="number"
                  min={0}
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("initialBetAmount", e.target.value)
                  }
                  value={values.initialBetAmount}
                />
              </div>
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">On Loss Bet Multiplier</p>
                <input
                  type="number"
                  min={0}
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("nextBetMultiplier", e.target.value)
                  }
                  value={values.nextBetMultiplier}
                />
              </div>
              <div className="flex flex-col text-white">
                <p className="font-mono text-sm">Reset On Loss Streak</p>
                <input
                  type="number"
                  min={0}
                  className="bg-slate-500 p-2 outline-none rounded-xl resize-none"
                  onChange={(e) =>
                    setFiledValue("stopAtCertainLossStreak", e.target.value)
                  }
                  value={values.stopAtCertainLossStreak}
                />
              </div>
              <button
                onClick={handleSaveAccountData}
                className="bg-green-500 w-full text-center p-2 rounded-xl mt-2"
              >
                Save
              </button>
            </div>
          </div>
          <div className="flex flex-1 bg-primarybg rounded-md m-2 p-2"></div>
        </div>
      </div>
    </div>
  );
}

const schema = z.object({
  cookie: z.string(),
  xAccessToken: z.string(),
  xLockDownToken: z.string(),
  balance: z.string(),
  initialBetAmount: z.string(),
  nextBetMultiplier: z.string(),
  stopAtCertainLossStreak: z.string(),
});
