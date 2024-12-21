import { twMerge } from "tailwind-merge";

interface IDiceHeaderProps {
    virtualBalance: string;
    realBalance : string;
    setServiceRunning : any;
    serviceRunningRef : any
    serviceRunning : boolean;
}

const DiceHeader: React.FC<IDiceHeaderProps> = ({
    virtualBalance,
    realBalance,
    setServiceRunning,
    serviceRunningRef,
    serviceRunning
}) => {
    
  return (
    <div className="flex">
      <p className="p-2 text-yellow-100 font-semibold font-sans">
        Stake Autobot Webui
      </p>
      <div className="flex flex-1 justify-center gap-4 items-center">
        <div className="bg-primarybg text-yellow-100 font-semibold text-xs mt-2 rounded-xl p-2">
          <p>Virtual Balance : {virtualBalance}</p>
        </div>
        <div className="bg-primarybg text-yellow-100 font-semibold text-xs mt-2 rounded-xl p-2">
          <p>Real Balance : {realBalance}</p>
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
  );
};

export default DiceHeader;
