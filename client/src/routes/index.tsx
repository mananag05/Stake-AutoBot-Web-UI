import { createFileRoute } from "@tanstack/react-router";
import useForm from "../hooks/useForm";
import { set, z } from "zod";
import { useDiceGame } from "../hooks/useDiceGame";
import localforage from "../src/utils/localForage";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/hide-scrollbar.module.scss";
import { twMerge } from "tailwind-merge";
import {
  handleSaveAccountData,
  handleSaveHeadersData,
  IDiceGameAccountData,
  IDiceGameHeadersData,
} from "../src/utils/updateDice";
import { Skeleton } from "@/components/ui/skeleton";
import { getRandomTimeOut } from "../hooks/useDiceGame";
import { getConstraints } from "../hooks/useDiceGame";

type HistoryItem = {
  result: "WON" | "LOST"; // assuming winORlose is either "WON" or "LOST"
  betAmount: number;
  payout: number;
  newBalance: number;
  currentLoseStreak: number;
  currentWinStreak: number;
  highestLoseStreak: number;
  highestWinStreak: number;
};

function RouteComponent() {
  const { mutateAsync } = useDiceGame();
  const numRegex = /^\d+(\.\d+)?$/;
  const [serviceRunning, setServiceRunning] = useState(false);
  const serviceRunningRef = useRef(serviceRunning);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[] | null>([]);
  const { values, setFiledValue } = useForm([], schema, {
    cookie: "",
    xAccessToken: "",
    xLockDownToken: "",
    realBalance: "",
    virtualBalance: "",
    initialBetAmount: "",
    nextBetMultiplier: "",
    stopAtCertainLossStreak: "",
    conditon: "above",
    target: "",
  });

  const virtualBank = useRef({
    balance: Number(values.virtualBalance),
    currentLoseStreak: 0,
    highestLoseStreak: 0,
    highestWinStreak: 0,
    currentWinStreak: 0,
    currentBetAmount: Number(values.initialBetAmount),
    nextBetAmount: Number(values.initialBetAmount),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await localforage.getItem<IDiceGameHeadersData>(
          "diceGameHeadersData"
        );
        const accountData = await localforage.getItem<IDiceGameAccountData>(
          "diceGameAccountData"
        );
        setFiledValue("cookie", data?.cookie);
        setFiledValue("xAccessToken", data?.xAccessToken);
        setFiledValue("xLockDownToken", data?.xLockDownToken);
        setFiledValue("virtualBalance", accountData?.virtualBalance || "10");
        virtualBank.current.balance = Number(
          accountData?.virtualBalance || "10"
        );
        setFiledValue("realBalance", accountData?.realBalance || "10");
        setFiledValue(
          "initialBetAmount",
          accountData?.initialBetAmount || "0.01"
        );
        virtualBank.current.currentBetAmount = Number(
          accountData?.initialBetAmount || "0.01"
        );
        setFiledValue(
          "nextBetMultiplier",
          accountData?.nextBetMultiplier || "2"
        );
        setFiledValue(
          "stopAtCertainLossStreak",
          accountData?.stopAtCertainLossStreak || "5"
        );
        setFiledValue("conditon", accountData?.conditon || "above");
        setFiledValue("target", accountData?.target || "50.5");
        setFiledValue("currency", accountData?.currency || "inr");
        setFiledValue("method", accountData?.method || "virtual");
      } catch (error) {
        console.error("Error fetching data from localforage:", error);
      }
    };
    fetchData().then(() => setLoading(false));
  }, []);

  const startVirtualService = async () => {
    try {
      const fetchedConstraints = getConstraints({
        condition: values.conditon as "above" | "below" | "switch",
        target: Number(values.target),
      });
      const bet = async ({
        constraints,
      }: {
        constraints: typeof fetchedConstraints;
      }) => {
        const response = await mutateAsync({
          amountToBet: 0,
          condition: constraints.condition || "above",
          cookie: values.cookie || "",
          currency: values.currency || "inr",
          target: constraints.target,
          xAccessToken: values.xAccessToken || "",
          xLockDownToken: values.xLockDownToken || "",
        });
        return response;
      };
      const response = await bet({ constraints: fetchedConstraints });
      const data = response.data.diceRoll;
      const result = data.state as {
        result: number;
        condition: "above" | "below";
        target: number;
      };
      if (data && serviceRunningRef.current) {
        const winORlose =
          result.condition === "above"
            ? result.result > result.target
              ? "WON"
              : "LOST"
            : result.result < result.target
              ? "WON"
              : "LOST";

        // updating history first
        if (winORlose === "WON") {
          const historyItem = {
            result: winORlose as "WON",
            betAmount: virtualBank.current.currentBetAmount,
            payout:
              winORlose === "WON"
                ? virtualBank.current.currentBetAmount *
                  (data.payoutMultiplier - 1)
                : 0,
            newBalance:
              winORlose === "WON"
                ? virtualBank.current.balance +
                  virtualBank.current.currentBetAmount *
                    (data.payoutMultiplier - 1)
                : virtualBank.current.balance -
                  virtualBank.current.currentBetAmount,
            currentLoseStreak: 0,
            currentWinStreak: virtualBank.current.currentWinStreak + 1,
            highestLoseStreak: virtualBank.current.highestLoseStreak,
            highestWinStreak:
              virtualBank.current.currentWinStreak + 1 >
              virtualBank.current.highestWinStreak
                ? virtualBank.current.currentWinStreak + 1
                : virtualBank.current.highestWinStreak,
          };
          setHistory((prev) => [...(prev || []), historyItem]);
        } else if (winORlose === "LOST") {
          const historyItem = {
            result: winORlose as "LOST",
            betAmount: virtualBank.current.currentBetAmount,
            payout: 0,
            newBalance:
              virtualBank.current.balance -
              virtualBank.current.currentBetAmount,
            currentLoseStreak: virtualBank.current.currentLoseStreak + 1,
            currentWinStreak: 0,
            highestLoseStreak:
              virtualBank.current.currentLoseStreak + 1 >
              virtualBank.current.highestLoseStreak
                ? virtualBank.current.currentLoseStreak + 1
                : virtualBank.current.highestLoseStreak,
            highestWinStreak: virtualBank.current.highestWinStreak,
          };
          setHistory((prev) => [...(prev || []), historyItem]);
        }

        if (winORlose === "WON") {
          virtualBank.current.currentWinStreak++;
          virtualBank.current.currentLoseStreak = 0;
          setFiledValue(
            "virtualBalance",
            String(
              Number(virtualBank.current.balance) +
                Number(virtualBank.current.currentBetAmount) *
                  Number(data.payoutMultiplier - 1)
            )
          );
          virtualBank.current.balance =
            virtualBank.current.balance +
            virtualBank.current.currentBetAmount * (data.payoutMultiplier - 1);
          if (
            virtualBank.current.currentWinStreak >
            virtualBank.current.highestWinStreak
          ) {
            virtualBank.current.highestWinStreak =
              virtualBank.current.currentWinStreak;
          }
        } else if (winORlose == "LOST") {
          virtualBank.current.currentLoseStreak++;
          virtualBank.current.currentWinStreak = 0;
          setFiledValue(
            "virtualBalance",
            String(
              Number(virtualBank.current.balance) -
                Number(virtualBank.current.currentBetAmount)
            )
          );
          virtualBank.current.balance = virtualBank.current.balance - virtualBank.current.currentBetAmount;
          
          virtualBank.current.nextBetAmount =
            Number(virtualBank.current.nextBetAmount) *
            Number(values.nextBetMultiplier);
          if (
            virtualBank.current.currentLoseStreak >
            virtualBank.current.highestLoseStreak
          ) {
            virtualBank.current.highestLoseStreak =
              virtualBank.current.currentLoseStreak;
          }
        }
      } else {
        throw new Error("Error: No data received from server");
      }
      if (serviceRunningRef.current) {
        setTimeout(() => {
          startVirtualService();
        }, getRandomTimeOut());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (serviceRunning) {
      if (values.method === "virtual") {
        startVirtualService();
      }
      if (values.method === "real") {
      }
    } else {
      return;
    }
  }, [serviceRunning]);

  return (
    <div className="bg-primarybg h-full p-2">
      <div className=" bg-[#595959] flex flex-col h-full w-full rounded-md">
        {!loading && (
          <>
            <div className="flex">
              <p className="p-2 text-yellow-100 font-semibold font-sans">
                Stake Autobot Webui
              </p>
              <div className="flex flex-1 justify-center gap-4 items-center">
                <div className="bg-primarybg text-yellow-100 font-semibold text-xs mt-2 rounded-xl p-2">
                  <p>Virtual Balance : {values.virtualBalance}</p>
                </div>
                <div className="bg-primarybg text-yellow-100 font-semibold text-xs mt-2 rounded-xl p-2">
                  <p>Real Balance : {values.realBalance}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setServiceRunning(!serviceRunning);
                  serviceRunningRef.current = !serviceRunningRef.current;
                }}
                className={twMerge(
                  "transition-all duration-300 w-28 p-2 mt-2 mr-4 px-6 rounded-xl ml-auto h-9 text-xs text-center text-yellow-100 font-semibold",
                  serviceRunning ? "bg-red-500" : "bg-green-500 text-black"
                )}
              >
                {serviceRunning ? "STOP" : "START"}
              </button>
            </div>

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
                      className={twMerge(
                        "bg-primarybg p-2 outline-none rounded-xl resize-none",
                        styles["hide-scrollbar"]
                      )}
                      disabled={serviceRunning}
                      onChange={(e) => setFiledValue("cookie", e.target.value)}
                      value={values.cookie}
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">xAccessToken*</p>
                    <input
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("xAccessToken", e.target.value)
                      }
                      disabled={serviceRunning}
                      value={values.xAccessToken}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">xLockDownToken*</p>
                    <input
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("xLockDownToken", e.target.value)
                      }
                      disabled={serviceRunning}
                      value={values.xLockDownToken}
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleSaveHeadersData({
                        cookie: values.cookie || "",
                        xAccessToken: values.xAccessToken || "",
                        xLockDownToken: values.xLockDownToken || "",
                      })
                    }
                    disabled={serviceRunning}
                    className="bg-green-500 w-full text-center p-2 rounded-xl mt-2"
                  >
                    Save
                  </button>
                </div>
                <div className="p-2 flex flex-col gap-2 bg-neutral-800 rounded-xl m-2">
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Set Real Balance</p>
                    <input
                      type="number"
                      min={0}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("realBalance", e.target.value)
                      }
                      value={values.realBalance}
                      disabled={serviceRunning}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Set Virtual Balance</p>
                    <input
                      type="number"
                      min={0}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("virtualBalance", e.target.value)
                      }
                      value={values.virtualBalance}
                      disabled={serviceRunning}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Set Initial Bet</p>
                    <input
                      type="number"
                      min={0}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("initialBetAmount", e.target.value)
                      }
                      value={values.initialBetAmount}
                      disabled={serviceRunning}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">On Loss Bet Multiplier</p>
                    <input
                      type="number"
                      min={0}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("nextBetMultiplier", e.target.value)
                      }
                      disabled={serviceRunning}
                      value={values.nextBetMultiplier}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Reset On Loss Streak</p>
                    <input
                      type="number"
                      min={0}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) =>
                        setFiledValue("stopAtCertainLossStreak", e.target.value)
                      }
                      disabled={serviceRunning}
                      value={values.stopAtCertainLossStreak}
                    />
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Method</p>
                    <select
                      onChange={(e) =>
                        setFiledValue(
                          "method",
                          e.target.value as "virtual" | "real"
                        )
                      }
                      disabled={serviceRunning}
                      value={values.method || "virtual"}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                    >
                      <option value="virtual">Virtual</option>
                      <option value="real">Real</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Currency</p>
                    <select
                      onChange={(e) =>
                        setFiledValue(
                          "conditon",
                          e.target.value as "switch" | "above" | "below"
                        )
                      }
                      disabled={serviceRunning}
                      value={values.conditon || "switch"}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                    >
                      <option value="inr">INR</option>
                      <option value="btc">BTC</option>
                      <option value="eth">ETH</option>
                      <option value="usdt">USDT</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Condition</p>
                    <select
                      onChange={(e) =>
                        setFiledValue(
                          "conditon",
                          e.target.value as "switch" | "above" | "below"
                        )
                      }
                      disabled={serviceRunning}
                      value={values.conditon || "switch"}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                    >
                      <option value="switch">Switch</option>
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-white">
                    <p className="font-mono text-sm">Target</p>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="bg-primarybg p-2 outline-none rounded-xl resize-none"
                      onChange={(e) => {
                        const newValue = Math.min(Number(e.target.value), 100);
                        setFiledValue("target", String(newValue));
                      }}
                      disabled={serviceRunning}
                      value={values.target}
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleSaveAccountData({
                        virtualBalance: values.virtualBalance || "",
                        initialBetAmount: values.initialBetAmount || "",
                        nextBetMultiplier: values.nextBetMultiplier || "",
                        stopAtCertainLossStreak:
                          values.stopAtCertainLossStreak || "",
                        conditon: values.conditon || "above",
                        target: values.target || "",
                        realBalance: values.realBalance || "",
                        currency: values.currency || "inr",
                        method: values.method || "virtual",
                      })
                    }
                    disabled={serviceRunning}
                    className="bg-green-500 w-full text-center p-2 rounded-xl mt-2"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="bg-primarybg flex-1 rounded-md m-2 p-2">
                {history && (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-700 font-semibold">
                          <th className="p-4 text-center">Result</th>
                          <th className="p-4 text-center">Bet Amount</th>
                          <th className="p-4 text-center">Payout</th>
                          <th className="p-4 text-center">New Balance</th>
                          <th className="p-4 text-center">Lose Streak</th>
                          <th className="p-4 text-center">Win Streak</th>
                          <th className="p-4 text-center">
                            Highest Lose Streak
                          </th>
                          <th className="p-4 text-center">
                            Highest Win Streak
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-4 text-center">{item.result}</td>
                            <td className="p-4 text-center">
                              {item.betAmount}
                            </td>
                            <td className="p-4 text-center">{item.payout}</td>
                            <td className="p-4 text-center">
                              {item.newBalance}
                            </td>
                            <td className="p-4 text-center">
                              {item.currentLoseStreak}
                            </td>
                            <td className="p-4 text-center">
                              {item.currentWinStreak}
                            </td>
                            <td className="p-4 text-center">
                              {item.highestLoseStreak}
                            </td>
                            <td className="p-4 text-center">
                              {item.highestWinStreak}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {loading && <Skeleton className="h-full w-full bg-transparent/20" />}
      </div>
    </div>
  );
}

const currencySchema = z.enum(["btc", "eth", "usdt", "inr"]);
export type TCurrency = z.infer<typeof currencySchema>;

const schema = z.object({
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

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
