import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Geist } from "next/font/google";
import { useProvisioning } from "@/hooks/useProvisioning";
import { ApiKeyStep } from "@/components/onboarding/ApiKeyStep";
import { ProvisioningStep } from "@/components/onboarding/ProvisioningStep";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const STEPS = ["Connect", "Set Up Environment", "Explore"];

const ORG_ID_STORAGE_KEY = "zilliz-onboarding-org-id";

function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= activeStep
                  ? "bg-blue-1 text-white"
                  : "bg-black-4 text-black-3"
              }`}
            >
              {i < activeStep ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm ${
                i <= activeStep
                  ? "font-medium text-black-1"
                  : "text-black-3"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-10 ${
                i < activeStep ? "bg-blue-1" : "bg-stroke-1"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { state, setApiKey, goBack, retry, switchToExisting } =
    useProvisioning();
  const router = useRouter();

  // Capture orgId from the URL query (read after mount to avoid SSR mismatch)
  // and persist it so the API-key hint can link straight to the org's page.
  const [orgId, setOrgId] = useState("");
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("orgId");
    if (fromQuery) {
      sessionStorage.setItem(ORG_ID_STORAGE_KEY, fromQuery);
      setOrgId(fromQuery);
    } else {
      const stored = sessionStorage.getItem(ORG_ID_STORAGE_KEY);
      if (stored) setOrgId(stored);
    }
  }, []);

  // Redirect to playground once provisioning is complete
  useEffect(() => {
    if (state.activeStep === 2) {
      router.replace("/playground");
    }
  }, [state.activeStep, router]);

  return (
    <div
      className={`${geistSans.className} flex min-h-[calc(100vh-56px)] items-start justify-center pt-16 font-sans`}
    >
      <main className="w-full max-w-xl">
        <h1 className="mb-8 text-center text-lg font-semibold text-black-1">
          Zilliz Cloud Onboarding
        </h1>

        <div className="mb-10">
          <Stepper activeStep={state.activeStep} />
        </div>

        <div className="rounded-card border border-stroke-1 bg-white p-8 shadow-light">
          {state.activeStep === 0 && (
            <ApiKeyStep
              onSubmit={setApiKey}
              initialMode={state.mode}
              initialApiKey={state.apiKey}
              orgId={orgId}
            />
          )}

          {state.activeStep === 1 && (
            <ProvisioningStep
              mode={state.mode}
              phase={state.provisioningPhase}
              error={state.error}
              clusterLimitHit={state.clusterLimitHit}
              projectCreated={!!state.projectId}
              clusterReady={!!state.clusterEndpoint}
              collectionCreated={state.collectionCreated}
              onRetry={retry}
              onGoBack={goBack}
              onUseExisting={switchToExisting}
            />
          )}

        </div>
      </main>
    </div>
  );
}
