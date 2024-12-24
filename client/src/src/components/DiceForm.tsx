import { twMerge } from "tailwind-merge";
import styles from "../../styles/hide-scrollbar.module.scss";
import {
  handleSaveAccountData,
  handleSaveHeadersData,
  handleUpdateEnableChunksBetting,
} from "../utils/updateDice";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

const DiceForm = ({
  values,
  setFiledValue,
  serviceRunning,
}: {
  values: any;
  setFiledValue: any;
  serviceRunning: boolean;
}) => {
  
  useEffect(() => {
    const handleWheelEvent = (event: WheelEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === "number"
      ) {
        activeElement.blur();
      }
    };
    document.addEventListener("wheel", handleWheelEvent);
    return () => {
      document.removeEventListener("wheel", handleWheelEvent);
    };
  }, []);

  return (
    <div
      className={twMerge(
        `flex flex-col max-w-96 overflow-y-auto gap-3 -ml-2 bg-neutral-700 rounded-se-2xl`,
        styles["hide-scrollbar"]
      )}
    >
      <div className="p-2 flex flex-col gap-2 bg-neutral-800 rounded-xl m-2">
        <div className="flex flex-col text-white">
          <p className="text-sm">Cookie*</p>
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
          <p className="text-sm">xAccessToken*</p>
          <input
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("xAccessToken", e.target.value)}
            disabled={serviceRunning}
            value={values.xAccessToken}
          />
        </div>
        <div className="flex flex-col text-white">
          <p className="text-sm">xLockDownToken*</p>
          <input
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("xLockDownToken", e.target.value)}
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
          <p className="text-sm">Set Real Balance</p>
          <input
            type="number"
            min={0}
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("realBalance", e.target.value)}
            value={values.realBalance}
            disabled={serviceRunning}
          />
        </div>
        <div className="flex flex-col text-white">
          <p className="text-sm">Set Virtual Balance</p>
          <input
            type="number"
            min={0}
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("virtualBalance", e.target.value)}
            value={values.virtualBalance}
            disabled={serviceRunning}
          />
        </div>
        <div className="flex flex-col text-white">
          <p className="text-sm">Set Initial Bet</p>
          <input
            type="number"
            min={0}
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("initialBetAmount", e.target.value)}
            value={values.initialBetAmount}
            disabled={serviceRunning}
          />
        </div>
        <div className="flex flex-col text-white">
          <p className="text-sm">On Loss Bet Multiplier</p>
          <input
            type="number"
            min={0}
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => setFiledValue("nextBetMultiplier", e.target.value)}
            disabled={serviceRunning}
            value={values.nextBetMultiplier}
          />
        </div>
        <div className="flex flex-col text-white">
          <p className="text-sm">Reset On Loss Streak</p>
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
          <p className="text-sm">Method</p>
          <select
            onChange={(e) =>
              setFiledValue("method", e.target.value as "virtual" | "real")
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
          <p className="text-sm">Currency</p>
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
          <p className="text-sm">Condition</p>
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
          <p className="text-sm">Target</p>
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
        <div className="flex flex-col text-white">
          <p className="text-sm">Stop when virtual balance reach</p>
          <input
            type="number"
            min={0}
            className="bg-primarybg p-2 outline-none rounded-xl resize-none"
            onChange={(e) => {
              setFiledValue("stopAtVirtualBalnce", e.target.value);
            }}
            disabled={serviceRunning}
            value={values.stopAtVirtualBalnce}
          />
        </div>
        <button
          onClick={() =>
            handleSaveAccountData({
              virtualBalance: values.virtualBalance || "",
              initialBetAmount: values.initialBetAmount || "",
              nextBetMultiplier: values.nextBetMultiplier || "",
              stopAtCertainLossStreak: values.stopAtCertainLossStreak || "",
              conditon: values.conditon || "above",
              target: values.target || "",
              realBalance: values.realBalance || "",
              currency: values.currency || "inr",
              method: values.method || "virtual",
              stopAtVirtualBalnce: values.stopAtVirtualBalnce,
            })
          }
          disabled={serviceRunning}
          className="bg-green-500 w-full text-center p-2 rounded-xl mt-2"
        >
          Save
        </button>
      </div>
      <div className="p-2 flex flex-col gap-2 items-center bg-neutral-800 rounded-xl m-2">
        <div className="flex gap-2 items-center">
          <p className="text-white text-sm mr-auto">• Enable Chunks Betting</p>
          <Switch
            checked={values.enableChunksBetting}
            onCheckedChange={(e) => {
              setFiledValue("enableChunksBetting", e);
              handleUpdateEnableChunksBetting(e);
            }}
            disabled={serviceRunning}
          />
        </div>
          <div className="flex flex-col gap-1 text-white">
            <p className="text-sm">Set payout when balance reach</p>
            <input
              type="number"
              min={0}
              className="bg-primarybg p-2 outline-none rounded-xl resize-none"
              onChange={(e) => {
                const newValue = Math.min(Number(e.target.value), 100);
                setFiledValue("stopAtVirtualBalnce", String(newValue));
              }}
              disabled={serviceRunning}
              value={values.stopAtVirtualBalnce}
            />
          </div>
      </div>
    </div>
  );
};

export default DiceForm;
