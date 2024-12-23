import { createFileRoute } from "@tanstack/react-router";
import useForm from "../hooks/useForm";
import { createGetConstraints, useDiceGame } from "../hooks/useDiceGame";
import localforage from "../src/utils/localForage";
import { useEffect, useRef, useState } from "react";
import {
  IDiceGameAccountData,
  IDiceGameHeadersData,
} from "../src/utils/updateDice";
import { Skeleton } from "@/components/ui/skeleton";
import { getRandomTimeOut } from "../hooks/useDiceGame";
import { schema } from "@/Schemas";
import DiceForm from "@/src/components/DiceForm";
import DiceHeader from "@/src/components/Header";
import DiceHistory, { HistoryItem } from "@/src/components/DiceHistory";
import toast from "react-hot-toast";
const getConstraints = createGetConstraints();

function RouteComponent() {
  const { mutateAsync } = useDiceGame();
  const [serviceRunning, setServiceRunning] = useState(false);
  const serviceRunningRef = useRef(serviceRunning);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[] | null>([]);
  const [totalPayout, setTotalPayout] = useState(0);
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
    stopAtVirtualBalnce: "0",
    enableChunksBetting: false,
  });

  const virtualBank = useRef({
    balance: Number(values.virtualBalance),
    currentLoseStreak: 0,
    highestLoseStreak: 0,
    highestWinStreak: 0,
    currentWinStreak: 0,
    currentBetAmount: Number(values.initialBetAmount),
    nextBetAmount: Number(values.initialBetAmount),
    initialBetAmount: Number(values.initialBetAmount),
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
        setFiledValue(
          "stopAtVirtualBalnce",
          accountData?.stopAtVirtualBalnce || "0"
        );
        setFiledValue(
          "enableChunksBetting",
          accountData?.enableChunksBetting || false
        );
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
      if (data) {
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
          // won virtual
          virtualBank.current.balance +=
            virtualBank.current.currentBetAmount * (data.payoutMultiplier - 1);
          virtualBank.current.currentBetAmount = Number(
            values.initialBetAmount
          );
          virtualBank.current.currentWinStreak += 1;
          virtualBank.current.currentLoseStreak = 0;
          setFiledValue(
            "virtualBalance",
            virtualBank.current.balance.toString()
          );
          if (
            virtualBank.current.currentWinStreak >
            virtualBank.current.highestWinStreak
          ) {
            virtualBank.current.highestWinStreak =
              virtualBank.current.currentWinStreak;
          }
        } else if (winORlose == "LOST") {
          // lost virtual
          virtualBank.current.balance -= virtualBank.current.currentBetAmount;
          virtualBank.current.currentLoseStreak += 1;
          virtualBank.current.currentWinStreak = 0;
          if (
            virtualBank.current.currentLoseStreak ===
            Number(values.stopAtCertainLossStreak)
          ) {
            virtualBank.current.currentBetAmount = Number(
              values.initialBetAmount
            );
            virtualBank.current.currentLoseStreak = 0;
          } else {
            virtualBank.current.currentBetAmount *= Number(
              values.nextBetMultiplier
            );
          }
          setFiledValue(
            "virtualBalance",
            virtualBank.current.balance.toString()
          );
          if (
            virtualBank.current.currentLoseStreak >
            virtualBank.current.highestLoseStreak
          ) {
            virtualBank.current.highestLoseStreak =
              virtualBank.current.currentLoseStreak;
          }
          if (
            virtualBank.current.balance < virtualBank.current.currentBetAmount
          ) {
            if(values.enableChunksBetting){
              toast.success("Reset !")
              const data = await localforage.getItem<IDiceGameAccountData>("diceGameAccountData");
              setTotalPayout((prev) => prev + (virtualBank.current.balance - Number(data?.virtualBalance)));
              virtualBank.current.balance = Number(data?.virtualBalance || "10");
              virtualBank.current.currentLoseStreak = 0;
              virtualBank.current.highestLoseStreak = 0;
              virtualBank.current.highestWinStreak = 0;
              virtualBank.current.currentWinStreak = 0;
              virtualBank.current.currentBetAmount = Number(data?.initialBetAmount || "0.01");
              virtualBank.current.nextBetAmount = Number(data?.initialBetAmount || "0.01");
              setFiledValue("virtualBalance", data?.virtualBalance || "10");
              setFiledValue("realBalance", data?.realBalance || "10");
              setFiledValue("initialBetAmount", data?.initialBetAmount || "0.01");
              setFiledValue("nextBetMultiplier", data?.nextBetMultiplier || "2");
              setFiledValue("stopAtCertainLossStreak", data?.stopAtCertainLossStreak || "5");
              setTimeout(() => {
                startVirtualService();
              }, 200);
              return
            }
            toast.error("Virtual balance is less than current bet amount");
            setServiceRunning(false);
            serviceRunningRef.current = false;
          }
        }
      } else {
        throw new Error("Error: No data received from server");
      }
      if (
        serviceRunningRef.current &&
        virtualBank.current.balance < Number(values.stopAtVirtualBalnce)
      ) {
        setTimeout(() => {
          startVirtualService();
        }, 200);
      }
      if (
        serviceRunningRef.current &&
        virtualBank.current.balance >= Number(values.stopAtVirtualBalnce)
      ) {
        if(values.enableChunksBetting){
          toast.success("Reset !")
          const data = await localforage.getItem<IDiceGameAccountData>("diceGameAccountData");
          setTotalPayout((prev) => prev + (virtualBank.current.balance - Number(data?.virtualBalance)));
          virtualBank.current.balance = Number(data?.virtualBalance || "10");
          virtualBank.current.currentLoseStreak = 0;
          virtualBank.current.highestLoseStreak = 0;
          virtualBank.current.highestWinStreak = 0;
          virtualBank.current.currentWinStreak = 0;
          virtualBank.current.currentBetAmount = Number(data?.initialBetAmount || "0.01");
          virtualBank.current.nextBetAmount = Number(data?.initialBetAmount || "0.01");
          setFiledValue("virtualBalance", data?.virtualBalance || "10");
          setFiledValue("realBalance", data?.realBalance || "10");
          setFiledValue("initialBetAmount", data?.initialBetAmount || "0.01");
          setFiledValue("nextBetMultiplier", data?.nextBetMultiplier || "2");
          setFiledValue("stopAtCertainLossStreak", data?.stopAtCertainLossStreak || "5");
          setTimeout(() => {
            startVirtualService();
          }, 200);
          return
        }
        setServiceRunning(false);
        serviceRunningRef.current = false;
        toast.success("Virtual balance reached to stop limit");
      }
    } catch (error) {
      console.error("Error:", error);
      if (serviceRunningRef.current) {
        setTimeout(() => {
          startVirtualService();
        }, 200);
      }
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

  console.log('totalPayout', totalPayout)

  return (
    <div className="bg-primarybg h-full p-2">
      <div className=" bg-[#595959] flex flex-col h-full w-full rounded-md">
        {!loading && (
          <>
            <DiceHeader
              realBalance={values.realBalance || "0"}
              serviceRunning={serviceRunning}
              serviceRunningRef={serviceRunningRef}
              setServiceRunning={setServiceRunning}
              virtualBalance={values.virtualBalance || "0"}
              chunksBettingEnabled={values.enableChunksBetting}
            />
            <div className="flex flex-1 overflow-hidden">
              <DiceForm
                serviceRunning={serviceRunning}
                setFiledValue={setFiledValue}
                values={values}
              />
              <div className="bg-primarybg flex-1 rounded-md m-2 p-2 flex flex-col">
                {history && <DiceHistory history={history} />}
              </div>
            </div>
          </>
        )}
        {loading && <Skeleton className="h-full w-full bg-transparent/20" />}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
