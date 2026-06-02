import { useState } from "react";
import type { ProvisioningMode } from "@/hooks/useProvisioning";

interface ApiKeyStepProps {
  onSubmit: (apiKey: string, mode: ProvisioningMode, endpoint?: string) => void;
  initialMode?: ProvisioningMode;
  initialApiKey?: string;
}

const TABS: { id: ProvisioningMode; label: string }[] = [
  { id: "create", label: "Create for me" },
  { id: "existing", label: "Use existing cluster" },
];

export function ApiKeyStep({
  onSubmit,
  initialMode = "create",
  initialApiKey = "",
}: ApiKeyStepProps) {
  const [mode, setMode] = useState<ProvisioningMode>(initialMode);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [endpoint, setEndpoint] = useState("");
  const [showKey, setShowKey] = useState(false);

  const canSubmit =
    apiKey.trim().length > 0 &&
    (mode === "create" || endpoint.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(
      apiKey.trim(),
      mode,
      mode === "existing" ? endpoint.trim() : undefined
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-black-1">
          Connect to Zilliz Cloud
        </h2>
        <p className="mt-2 text-sm text-black-2">
          {mode === "create"
            ? "Enter your API key and we'll set up a free cluster for the demo."
            : "Already have a cluster? Connect it and we'll add a demo collection."}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 rounded-badge bg-black-5 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`flex-1 cursor-pointer rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === tab.id
                ? "bg-white text-black-1 shadow-light"
                : "text-black-3 hover:text-black-2"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "existing" && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="cluster-endpoint"
            className="text-sm font-medium text-black-1"
          >
            Cluster Endpoint
          </label>
          <input
            id="cluster-endpoint"
            type="text"
            placeholder="https://in03-xxxx.serverless.gcp-us-west1.cloud.zilliz.com"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-badge border border-stroke-1 px-3 py-2 text-sm text-black-1 placeholder-black-3 outline-none transition-colors focus:border-blue-1 focus:ring-2 focus:ring-blue-1/20"
          />
          <p className="text-xs text-black-3">
            Copy the Public Endpoint from your cluster&apos;s connect page in the
            Zilliz Cloud Console.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="api-key" className="text-sm font-medium text-black-1">
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
        {mode === "create" ? (
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
        ) : (
          <p className="text-xs text-black-3">
            Make sure this API key has read &amp; write access to the project the
            cluster belongs to.
          </p>
        )}
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
          Your API key is used only for this demo session. It is transmitted over
          HTTPS and never stored on our servers.{" "}
          {mode === "create"
            ? "This demo will create a free-tier cluster in your account."
            : "This demo will add a collection to your existing cluster."}
        </span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="cursor-pointer rounded-badge bg-blue-1 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-dark-1 disabled:cursor-not-allowed disabled:bg-black-4 disabled:text-black-3"
      >
        {mode === "create" ? "Connect & Set Up" : "Connect & Add Collection"}
      </button>
    </div>
  );
}
