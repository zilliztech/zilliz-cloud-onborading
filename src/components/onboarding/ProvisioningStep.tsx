import { useState, useEffect } from "react";
import { ProvisioningStatusCard } from "./ProvisioningStatusCard";
import type { ProvisioningPhase, ProvisioningMode } from "@/hooks/useProvisioning";

interface ProvisioningStepProps {
  mode: ProvisioningMode;
  phase: ProvisioningPhase;
  error: string | null;
  clusterLimitHit: boolean;
  projectCreated: boolean;
  clusterReady: boolean;
  collectionCreated: boolean;
  onRetry: () => void;
  onGoBack: () => void;
  onUseExisting: () => void;
}

function ProjectIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ClusterIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

function CollectionIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function useSimulatedProgress(phase: ProvisioningPhase): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase === "done") {
      setProgress(100);
      return;
    }
    if (phase === "error" || phase === "idle") return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      let value: number;
      if (elapsed < 5) {
        value = (elapsed / 5) * 30;
      } else if (elapsed < 50) {
        value = 30 + ((elapsed - 5) / 45) * 55;
      } else {
        value = Math.min(85 + (elapsed - 50) * 0.1, 92);
      }

      setProgress(Math.round(value));
    }, 500);

    return () => clearInterval(timer);
  }, [phase]);

  return progress;
}

type StepStatus = "pending" | "in-progress" | "done" | "error";

function getProjectStatus(
  phase: ProvisioningPhase,
  projectCreated: boolean
): { status: StepStatus; text: string } {
  if (projectCreated)
    return { status: "done", text: "Ready" };
  if (phase === "creating-project")
    return { status: "in-progress", text: "Creating..." };
  if (phase === "error")
    return { status: "error", text: "Failed" };
  return { status: "pending", text: "Pending" };
}

function getClusterStatus(
  phase: ProvisioningPhase,
  clusterReady: boolean
): { status: StepStatus; text: string } {
  if (clusterReady)
    return { status: "done", text: "Ready" };
  if (phase === "creating-cluster")
    return { status: "in-progress", text: "Creating..." };
  if (phase === "waiting-for-cluster")
    return { status: "in-progress", text: "Provisioning..." };
  if (phase === "error")
    return { status: "error", text: "Failed" };
  return { status: "pending", text: "Pending" };
}

function getCollectionStatus(
  phase: ProvisioningPhase,
  collectionCreated: boolean
): { status: StepStatus; text: string } {
  if (collectionCreated)
    return { status: "done", text: "Ready" };
  if (phase === "creating-collection")
    return { status: "in-progress", text: "Creating..." };
  if (phase === "error")
    return { status: "error", text: "Failed" };
  return { status: "pending", text: "Waiting..." };
}

// Existing-cluster mode: the cluster is the user's, so we only show a
// connection check instead of project/cluster creation cards.
function getConnectionStatus(
  phase: ProvisioningPhase,
  collectionCreated: boolean
): { status: StepStatus; text: string } {
  if (phase === "connecting")
    return { status: "in-progress", text: "Connecting..." };
  if (phase === "error")
    return { status: "error", text: "Failed" };
  if (phase === "creating-collection" || phase === "done" || collectionCreated)
    return { status: "done", text: "Connected" };
  return { status: "pending", text: "Pending" };
}

function getProgressLabel(phase: ProvisioningPhase): string {
  switch (phase) {
    case "creating-project":
      return "Creating project...";
    case "creating-cluster":
      return "Creating cluster...";
    case "waiting-for-cluster":
      return "Cluster is starting up...";
    case "connecting":
      return "Connecting to your cluster...";
    case "creating-collection":
      return "Creating collection...";
    case "done":
      return "All set!";
    default:
      return "";
  }
}

export function ProvisioningStep({
  mode,
  phase,
  error,
  clusterLimitHit,
  projectCreated,
  clusterReady,
  collectionCreated,
  onRetry,
  onGoBack,
  onUseExisting,
}: ProvisioningStepProps) {
  const isExisting = mode === "existing";
  const progress = useSimulatedProgress(phase);
  const project = getProjectStatus(phase, projectCreated);
  const cluster = getClusterStatus(phase, clusterReady);
  const collection = getCollectionStatus(phase, collectionCreated);
  const connection = getConnectionStatus(phase, collectionCreated);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-black-1">
          Setting Up Your Environment
        </h2>
        <p className="mt-2 text-sm text-black-2">
          {isExisting
            ? "We're connecting to your cluster and adding a demo collection. This only takes a few seconds."
            : "We're creating a project, cluster and collection for you. This typically takes about a minute."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isExisting ? (
          <ProvisioningStatusCard
            icon={<ClusterIcon />}
            title="Cluster Connection"
            status={connection.status}
            statusText={connection.text}
          />
        ) : (
          <>
            <ProvisioningStatusCard
              icon={<ProjectIcon />}
              title="Project"
              status={project.status}
              statusText={project.text}
            />
            <ProvisioningStatusCard
              icon={<ClusterIcon />}
              title="Free Cluster"
              status={cluster.status}
              statusText={cluster.text}
            />
          </>
        )}
        <ProvisioningStatusCard
          icon={<CollectionIcon />}
          title="Collection"
          status={collection.status}
          statusText={collection.text}
        />
      </div>

      {phase !== "error" && (
        <div className="flex flex-col gap-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-black-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                phase === "done" ? "bg-green-2" : "bg-blue-1"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-black-3">
            {getProgressLabel(phase)}
          </p>
        </div>
      )}

      {phase === "error" && error && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-badge border border-red-3 bg-red-4 px-4 py-3 text-sm text-red-1">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
          {clusterLimitHit && (
            <p className="text-sm text-black-2">
              Your account already has a free cluster. Connect it directly and
              we&apos;ll add the demo collection to it.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onGoBack}
              className="cursor-pointer rounded-badge border border-stroke-2 px-4 py-2 text-sm font-medium text-black-1 transition-colors hover:bg-black-5"
            >
              Go Back
            </button>
            {clusterLimitHit ? (
              <button
                onClick={onUseExisting}
                className="cursor-pointer rounded-badge bg-blue-1 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark-1"
              >
                Use existing cluster
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="cursor-pointer rounded-badge bg-blue-1 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark-1"
              >
                Retry
              </button>
            )}
          </div>
          {!isExisting && !clusterLimitHit && (
            <p className="text-xs text-black-3">
              Already have a Zilliz Cloud cluster?{" "}
              <button
                type="button"
                onClick={onUseExisting}
                className="cursor-pointer font-medium text-blue-1 hover:underline"
              >
                Use it instead
              </button>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
