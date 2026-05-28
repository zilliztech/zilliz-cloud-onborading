import { useState } from "react";

interface ApiKeyStepProps {
  onSubmit: (apiKey: string) => void;
}

export function ApiKeyStep({ onSubmit }: ApiKeyStepProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-black-1">
          Connect to Zilliz Cloud
        </h2>
        <p className="mt-2 text-sm text-black-2">
          Enter your API key to get started with the demo.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="api-key"
          className="text-sm font-medium text-black-1"
        >
          API Key
        </label>
        <div className="relative">
          <input
            id="api-key"
            type={showKey ? "text" : "password"}
            placeholder="Enter your Zilliz Cloud API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-badge border border-stroke-1 px-3 py-2 pr-16 text-sm text-black-1 placeholder-black-3 outline-none transition-colors focus:border-blue-1 focus:ring-2 focus:ring-blue-1/20"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-black-3 hover:text-black-2"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-black-3">
          You can find or create your API key in the{" "}
          <a
            href="https://cloud.zilliz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-1 hover:underline"
          >
            Zilliz Cloud Console
          </a>{" "}
          under Project &gt; API Keys.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-badge border border-blue-3 bg-blue-5 px-4 py-3 text-sm text-blue-dark-2">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-blue-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          Your API key is used only for this demo session. It is transmitted
          over HTTPS and never stored on our servers. This demo will create a
          free-tier cluster in your account.
        </span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!apiKey.trim()}
        className="cursor-pointer rounded-badge bg-blue-1 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-dark-1 disabled:cursor-not-allowed disabled:bg-black-4 disabled:text-black-3"
      >
        Connect & Set Up
      </button>
    </div>
  );
}
