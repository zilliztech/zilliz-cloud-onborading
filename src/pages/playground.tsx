import { useState, useCallback, useEffect, useRef } from "react";
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
import { preloadDataset } from "@/data/playground";

const EMAIL_STORAGE_KEY = "zilliz-onboarding-email";

const STORAGE_KEY = "zilliz-onboarding-state";

export type DatasetId = "docs" | "legal" | "arxiv";
export type ChunkPreset = "small" | "balanced" | "large";

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

function PlaygroundContent() {
  const router = useRouter();
  const [onboarding] = useState<OnboardingState | null>(loadOnboardingState);

  // Guard: redirect to onboarding if not provisioned
  useEffect(() => {
    if (
      !onboarding ||
      onboarding.activeStep !== 2 ||
      onboarding.provisioningPhase !== "done"
    ) {
      router.replace("/");
    }
  }, [onboarding, router]);

  if (
    !onboarding ||
    onboarding.activeStep !== 2 ||
    onboarding.provisioningPhase !== "done"
  ) {
    return null;
  }

  const [activeStep, setActiveStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<DatasetId>("docs");
  const [selectedPreset, setSelectedPreset] = useState<ChunkPreset>("balanced");

  // Step completion states — gate step 5 behind 2/3/4
  const [chunkConfirmed, setChunkConfirmed] = useState(false);
  const [tagsConfirmed, setTagsConfirmed] = useState(false);
  const [embeddingConfirmed, setEmbeddingConfirmed] = useState(false);
  const [insertCompleted, setInsertCompleted] = useState(false);

  const canInsert = chunkConfirmed && tagsConfirmed && embeddingConfirmed;

  // Preload default dataset on mount
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (!preloadedRef.current) {
      preloadedRef.current = true;
      preloadDataset(selectedDataset);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture email from URL query and persist to sessionStorage
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      sessionStorage.setItem(EMAIL_STORAGE_KEY, emailFromQuery);
      setUserEmail(emailFromQuery);
    } else {
      const stored = sessionStorage.getItem(EMAIL_STORAGE_KEY);
      if (stored) setUserEmail(stored);
    }
  }, []);

  const handleSelectDataset = useCallback((id: DatasetId) => {
    setSelectedDataset(id);
    setChunkConfirmed(false);
    setTagsConfirmed(false);
    setEmbeddingConfirmed(false);
    setInsertCompleted(false);
    preloadDataset(id);
  }, []);

  const handleSelectPreset = useCallback((preset: ChunkPreset) => {
    setSelectedPreset(preset);
    setChunkConfirmed(false);
    setTagsConfirmed(false);
    setEmbeddingConfirmed(false);
    setInsertCompleted(false);
  }, []);

  const endpoint = onboarding.clusterEndpoint?.startsWith("https://")
    ? onboarding.clusterEndpoint
    : `https://${onboarding.clusterEndpoint}`;

  return (
    <div className="pt-8 pb-20">
      {/* Top bar */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#8592a8]">
            Build a complete RAG pipeline with Zilliz Cloud in your browser
          </span>
        </div>
        <StepNav activeStep={activeStep} />
      </div>

      {/* All sections visible */}
      <div className="space-y-10">
        <TryFirstSection onStart={() => {
          document.getElementById("step-data")?.scrollIntoView({ behavior: "smooth" });
        }} />
        <DataSection
          selectedDataset={selectedDataset}
          onSelectDataset={handleSelectDataset}
          onNext={() => {
            document.getElementById("step-chunk")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <ChunkSection
          datasetId={selectedDataset}
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          onConfirm={() => setChunkConfirmed(true)}
          confirmed={chunkConfirmed}
          onNext={() => {
            document.getElementById("step-tags")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <TagsSection
          datasetId={selectedDataset}
          preset={selectedPreset}
          onConfirm={() => setTagsConfirmed(true)}
          confirmed={tagsConfirmed}
          onNext={() => {
            document.getElementById("step-vector")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <VectorSection
          datasetId={selectedDataset}
          onConfirm={() => setEmbeddingConfirmed(true)}
          confirmed={embeddingConfirmed}
          onNext={() => {
            document.getElementById("step-ingest")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <IngestSection
          datasetId={selectedDataset}
          preset={selectedPreset}
          apiKey={onboarding.apiKey}
          clusterEndpoint={endpoint}
          collectionName={onboarding.collectionName!}
          canInsert={canInsert}
          onInsertComplete={() => setInsertCompleted(true)}
          onNext={() => {
            document.getElementById("step-search")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <SearchSection datasetId={selectedDataset} insertCompleted={insertCompleted} />
        <ExportSection datasetId={selectedDataset} preset={selectedPreset} email={userEmail} />
      </div>
    </div>
  );
}

// Wrapper to disable SSR — playground reads sessionStorage at init
import dynamic from "next/dynamic";
const PlaygroundPage = dynamic(() => Promise.resolve(PlaygroundContent), { ssr: false });
export default function Playground() {
  return <PlaygroundPage />;
}
