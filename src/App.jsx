import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY;
const SYMBOLS = "USD/BRL,USDT/USD";
const WS_URL = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`;

export default function App() {
  const [usdbrl, setUsdbrl] = useState(null);
  const [usdtusd, setUsdtusd] = useState(null);
  const [isInverted, setIsInverted] = useState(false);
  const [inputValue, setInputValue] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: "subscribe",
          params: { symbols: SYMBOLS },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "price") {
        if (data.symbol === "USD/BRL") setUsdbrl(parseFloat(data.price));
        if (data.symbol === "USDT/USD") setUsdtusd(parseFloat(data.price));
        setLastUpdate(new Date());
      }
    };

    return () => ws.close();
  }, []);

  const usdtbrl = usdbrl && usdtusd ? usdbrl * usdtusd : null;
  const result = usdtbrl
    ? isInverted
      ? inputValue / usdtbrl
      : inputValue * usdtbrl
    : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <img src="/noxpay-logo.webp" alt="NoxPay Logo" className="w-40 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Conversor USDT/BRL</h1>

      <div className="mb-2 text-center">
        <p className="text-lg">USD/BRL: {usdbrl?.toFixed(4) ?? "..."}</p>
        <p className="text-lg">USDT/USD: {usdtusd?.toFixed(4) ?? "..."}</p>
        <p className="text-xl font-semibold">USDT/BRL: {usdtbrl?.toFixed(4) ?? "..."}</p>
      </div>

      {lastUpdate && (
        <p className="text-sm text-gray-600 mt-1">
          Última atualização: {lastUpdate.toLocaleDateString()} {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      <div className="flex items-center gap-2 mt-4 mb-4">
        <input
          type="number"
          className="border p-2 rounded w-32 text-center"
          value={inputValue}
          onChange={(e) => setInputValue(Number(e.target.value))}
        />
        <span className="font-semibold">{isInverted ? "BRL" : "USDT"}</span>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => setIsInverted((v) => !v)}
        >
          ↔
        </button>
      </div>

      {result !== null && (
        <div className="text-lg font-medium">
          {isInverted
            ? `${result.toFixed(4)} USDT`
            : `${result.toFixed(2)} BRL`}
        </div>
      )}
    </div>
  );
}
