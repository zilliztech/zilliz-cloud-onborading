import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { StepNav } from "@/components/playground/StepNav";
import { TryFirstSection } from "@/components/playground/TryFirstSection";
import { DataSection } from "@/components/playground/DataSection";
import { ChunkSection } from "@/components/playground/ChunkSection";
import { TagsSection } from "@/components/playground/TagsSection";
import { VectorSection } from "@/components/playground/VectorSection";
import { IngestSection } from "@/components/playground/IngestSection";
import { SearchSection } from "@/components/playground/SearchSection";
import { ExportSection } from "@/components/playground/ExportSection";
import type { OnboardingState } from "@/hooks/useProvisioning";

const STORAGE_KEY = "zilliz-onboarding-state";

export type DatasetId = "docs" | "legal" | "arxiv";
export type ChunkPreset = "small" | "balanced" | "large";

// Map UI dataset id to file name prefix
export const DATASET_FILE_MAP: Record<DatasetId, string> = {
  docs: "enterprise_docs",
  legal: "legal_contracts",
  arxiv: "arxiv_papers",
};

export const DATASET_LABELS: Record<DatasetId, string> = {
  docs: "Enterprise Docs QA",
  legal: "Legal Contract Review",
  arxiv: "arXiv AI Papers",
};

function loadOnboardingState(): OnboardingState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Playground() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<DatasetId>("docs");
  const [selectedPreset, setSelectedPreset] = useState<ChunkPreset>("balanced");

  useEffect(() => {
    const state = loadOnboardingState();
    setOnboarding(
      state || {
        activeStep: 2,
        apiKey: "",
        projectName: null,
        projectId: null,
        clusterName: null,
        clusterId: null,
        clusterEndpoint: "",
        clusterUsername: null,
        clusterPassword: null,
        collectionName: "demo_collection",
        collectionCreated: true,
        provisioningPhase: "done",
        error: null,
        startTrigger: 0,
      }
    );
  }, [router]);

  if (!onboarding) return null;

  return (
    <div className="pt-8 pb-20">
      {/* Top bar */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,26,35,0.08)] bg-white px-2.5 py-1 text-[12px] font-medium text-[#3d4659] shadow-[0_1px_2px_rgba(13,43,72,0.04)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1493dc] shadow-[0_0_0_3px_rgba(20,147,220,0.18)]" />
            Prototype · v0.4 · Step 1–7
          </span>
          <span className="text-[13px] text-[#8592a8]">
            Build a complete RAG pipeline with Zilliz Cloud in your browser
          </span>
        </div>
        <StepNav activeStep={activeStep} />
      </div>

      {/* All sections visible */}
      <div className="space-y-10">
        <TryFirstSection onStart={() => {}} />
        <DataSection
          selectedDataset={selectedDataset}
          onSelectDataset={setSelectedDataset}
          onNext={() => {}}
        />
        <ChunkSection
          datasetId={selectedDataset}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          onNext={() => {}}
        />
        <TagsSection
          datasetId={selectedDataset}
          preset={selectedPreset}
          onNext={() => {}}
        />
        <VectorSection
          datasetId={selectedDataset}
          onNext={() => {}}
        />
        <IngestSection
          datasetId={selectedDataset}
          preset={selectedPreset}
          onNext={() => {}}
        />
        <SearchSection datasetId={selectedDataset} />
        <ExportSection datasetId={selectedDataset} preset={selectedPreset} />
      </div>
    </div>
  );
}
