import { useEffect, useReducer, useCallback, useRef } from "react";

// --- State & Actions ---

export type ProvisioningPhase =
  | "idle"
  | "creating-project"
  | "creating-cluster"
  | "waiting-for-cluster"
  | "connecting"
  | "creating-collection"
  | "done"
  | "error";

// "create": we provision a project + free cluster + collection.
// "existing": user brings their own running cluster; we only add a collection.
export type ProvisioningMode = "create" | "existing";

export interface OnboardingState {
  activeStep: 0 | 1 | 2;
  mode: ProvisioningMode;
  apiKey: string;
  // Set when create-cluster fails because the account already owns a free
  // cluster (Zilliz error 40045). Drives the "use existing cluster" hint.
  clusterLimitHit: boolean;
  projectName: string | null;
  projectId: string | null;
  clusterName: string | null;
  clusterId: string | null;
  clusterEndpoint: string | null;
  clusterUsername: string | null;
  clusterPassword: string | null;
  collectionName: string | null;
  collectionCreated: boolean;
  provisioningPhase: ProvisioningPhase;
  error: string | null;
  startTrigger: number;
}

type Action =
  | { type: "SET_API_KEY"; apiKey: string; mode: ProvisioningMode; endpoint?: string }
  | { type: "SWITCH_TO_EXISTING" }
  | { type: "CLUSTER_LIMIT_HIT"; error: string }
  | { type: "SET_PHASE"; phase: ProvisioningPhase }
  | { type: "HYDRATE"; state: OnboardingState }
  | {
      type: "PROJECT_CREATED";
      projectName: string;
      projectId: string;
    }
  | {
      type: "CLUSTER_CREATED";
      clusterName: string;
      clusterId: string;
      username: string;
      password: string;
    }
  | { type: "CLUSTER_READY"; endpoint: string }
  | { type: "COLLECTION_CREATED"; collectionName: string }
  | { type: "PROVISIONING_ERROR"; error: string }
  | { type: "ADVANCE_TO_DEMO" }
  | { type: "GO_BACK" }
  | { type: "RETRY" };

const initialState: OnboardingState = {
  activeStep: 0,
  mode: "create",
  apiKey: "",
  clusterLimitHit: false,
  projectName: null,
  projectId: null,
  clusterName: null,
  clusterId: null,
  clusterEndpoint: null,
  clusterUsername: null,
  clusterPassword: null,
  collectionName: null,
  collectionCreated: false,
  provisioningPhase: "idle",
  error: null,
  startTrigger: 0,
};

// --- SessionStorage persistence ---

const STORAGE_KEY = "zilliz-onboarding-state";

function saveState(state: OnboardingState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadState(): OnboardingState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as OnboardingState;
    // Reset transient fields — don't auto-resume provisioning on reload
    // If it was in progress, set to error so user can retry
    if (
      saved.provisioningPhase !== "done" &&
      saved.provisioningPhase !== "idle" &&
      saved.provisioningPhase !== "error"
    ) {
      saved.provisioningPhase = "error";
      saved.error = "Page was refreshed during provisioning. Click Retry to continue.";
    }
    // Don't carry over startTrigger — it will be set by retry/setApiKey
    saved.startTrigger = 0;
    return saved;
  } catch {
    return null;
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// --- Reducer ---

function reducer(state: OnboardingState, action: Action): OnboardingState {
  let next: OnboardingState;

  switch (action.type) {
    case "HYDRATE":
      // Restore persisted state after mount. Don't re-save — it's already
      // in sessionStorage, and this runs only to match SSR on first paint.
      return action.state;
    case "SET_API_KEY":
      next = {
        ...initialState,
        mode: action.mode,
        apiKey: action.apiKey,
        clusterEndpoint:
          action.mode === "existing" ? normalizeEndpoint(action.endpoint) : null,
        activeStep: 1,
        provisioningPhase: "idle",
        error: null,
        startTrigger: state.startTrigger + 1,
      };
      break;
    case "SWITCH_TO_EXISTING":
      // Bounce back to the connect step with the existing-cluster tab,
      // keeping the API key the user already entered.
      next = {
        ...initialState,
        mode: "existing",
        apiKey: state.apiKey,
        activeStep: 0,
      };
      break;
    case "CLUSTER_LIMIT_HIT":
      next = {
        ...state,
        provisioningPhase: "error",
        error: action.error,
        clusterLimitHit: true,
      };
      break;
    case "SET_PHASE":
      next = { ...state, provisioningPhase: action.phase, error: null };
      break;
    case "PROJECT_CREATED":
      next = {
        ...state,
        projectName: action.projectName,
        projectId: action.projectId,
        provisioningPhase: "creating-cluster",
      };
      break;
    case "CLUSTER_CREATED":
      next = {
        ...state,
        clusterName: action.clusterName,
        clusterId: action.clusterId,
        clusterUsername: action.username,
        clusterPassword: action.password,
        provisioningPhase: "waiting-for-cluster",
      };
      break;
    case "CLUSTER_READY":
      next = {
        ...state,
        clusterEndpoint: action.endpoint,
        provisioningPhase: "creating-collection",
      };
      break;
    case "COLLECTION_CREATED":
      next = {
        ...state,
        collectionName: action.collectionName,
        collectionCreated: true,
        provisioningPhase: "done",
      };
      break;
    case "ADVANCE_TO_DEMO":
      next = { ...state, activeStep: 2 };
      break;
    case "PROVISIONING_ERROR":
      next = { ...state, provisioningPhase: "error", error: action.error };
      break;
    case "GO_BACK":
      clearState();
      return initialState;
    case "RETRY":
      next = {
        ...state,
        provisioningPhase: "idle",
        error: null,
        clusterLimitHit: false,
        startTrigger: state.startTrigger + 1,
      };
      break;
    default:
      return state;
  }

  saveState(next);
  return next;
}

// --- Provisioning Logic ---

const POLL_INTERVAL = 3000;
const FREE_CLUSTER_REGION = "gcp-us-west1";
// Fixed name so re-running onboarding on the same cluster reuses one
// collection instead of piling up toward the free-tier limit.
const DEMO_COLLECTION_NAME = "onboarding_demo";
// Free clusters allow at most 10 collections.
const FREE_COLLECTION_LIMIT = 10;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEndpoint(endpoint?: string | null): string | null {
  if (!endpoint) return null;
  const trimmed = endpoint.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

function shortId() {
  return crypto.randomUUID().slice(0, 8);
}

async function runProvisioning(
  apiKey: string,
  state: OnboardingState,
  dispatch: React.Dispatch<Action>,
  signal: AbortSignal
) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // --- Existing-cluster mode: skip provisioning, only add a collection ---
    if (state.mode === "existing") {
      const endpoint = normalizeEndpoint(state.clusterEndpoint);
      if (!endpoint) {
        throw new Error("A cluster endpoint is required.");
      }

      // Probe connectivity + list collections (validates endpoint + key).
      dispatch({ type: "SET_PHASE", phase: "connecting" });
      const listRes = await fetch("/api/collections/list", {
        method: "POST",
        headers,
        body: JSON.stringify({ endpoint }),
        signal,
      });
      const listData = await listRes.json();
      if (!listRes.ok) {
        throw new Error(
          listData.message ||
            "Could not connect to the cluster. Check the endpoint and API key."
        );
      }
      if (signal.aborted) return;

      const collections: string[] = Array.isArray(listData.data)
        ? listData.data
        : [];

      // Reuse our demo collection if it already exists (idempotent re-runs).
      if (collections.includes(DEMO_COLLECTION_NAME)) {
        dispatch({
          type: "COLLECTION_CREATED",
          collectionName: DEMO_COLLECTION_NAME,
        });
        return;
      }
      if (collections.length >= FREE_COLLECTION_LIMIT) {
        throw new Error(
          `This cluster already has ${collections.length} collections (free-tier limit is ${FREE_COLLECTION_LIMIT}). Please drop one in the console, then retry.`
        );
      }

      dispatch({ type: "SET_PHASE", phase: "creating-collection" });
      const collRes = await fetch("/api/collections/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          endpoint,
          collectionName: DEMO_COLLECTION_NAME,
        }),
        signal,
      });
      const collData = await collRes.json();
      if (
        !collRes.ok ||
        (collData.code && collData.code !== 0 && collData.code !== 200)
      ) {
        throw new Error(collData.message || "Failed to create collection");
      }

      dispatch({
        type: "COLLECTION_CREATED",
        collectionName: DEMO_COLLECTION_NAME,
      });
      return;
    }

    // --- Step 1: Ensure project exists ---
    let projectId = state.projectId;
    if (!projectId) {
      dispatch({ type: "SET_PHASE", phase: "creating-project" });

      if (state.projectName) {
        const listRes = await fetch("/api/projects/list", {
          headers,
          signal,
        });
        const listData = await listRes.json();
        if (listRes.ok && listData.data) {
          const existing = listData.data.find(
            (p: { projectName: string; projectId: string }) =>
              p.projectName === state.projectName
          );
          if (existing) {
            projectId = existing.projectId;
            dispatch({
              type: "PROJECT_CREATED",
              projectName: state.projectName!,
              projectId: projectId!,
            });
          }
        }
      }

      if (!projectId) {
        const projectName = state.projectName || `onboarding-${shortId()}`;
        const projectRes = await fetch("/api/projects/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectName,
            regionIds: [FREE_CLUSTER_REGION],
            plan: "Standard",
          }),
          signal,
        });

        const projectData = await projectRes.json();
        if (
          !projectRes.ok ||
          (projectData.code && projectData.code !== 0)
        ) {
          throw new Error(
            projectData.message || "Failed to create project"
          );
        }
        projectId = projectData.data;
        dispatch({
          type: "PROJECT_CREATED",
          projectName,
          projectId: projectId!,
        });
      }
    }

    if (signal.aborted) return;

    // --- Step 2: Ensure cluster exists ---
    let clusterId = state.clusterId;
    let endpoint = state.clusterEndpoint;

    if (!clusterId) {
      dispatch({ type: "SET_PHASE", phase: "creating-cluster" });

      const clusterName = state.clusterName || `cluster-${shortId()}`;
      const createRes = await fetch("/api/clusters/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          clusterName,
          projectId,
          regionId: FREE_CLUSTER_REGION,
        }),
        signal,
      });

      const createData = await createRes.json();
      if (!createRes.ok || (createData.code && createData.code !== 0)) {
        const message = createData.message || "Failed to create cluster";
        // 40045: the account already owns a free cluster. Route the user to
        // the "use existing cluster" flow instead of a dead-end retry.
        if (/\b40045\b/.test(message) || /only have one free cluster/i.test(message)) {
          dispatch({ type: "CLUSTER_LIMIT_HIT", error: message });
          return;
        }
        throw new Error(message);
      }

      clusterId = createData.data.clusterId;
      dispatch({
        type: "CLUSTER_CREATED",
        clusterName,
        clusterId: clusterId!,
        username: createData.data.username,
        password: createData.data.password,
      });
    }

    if (signal.aborted) return;

    // --- Step 3: Wait for cluster to be ready ---
    if (!endpoint) {
      dispatch({ type: "SET_PHASE", phase: "waiting-for-cluster" });

      while (!signal.aborted) {
        await sleep(POLL_INTERVAL);
        if (signal.aborted) return;

        const descRes = await fetch(`/api/clusters/${clusterId}`, {
          headers,
          signal,
        });
        const descData = await descRes.json();

        if (descData.data?.status === "RUNNING") {
          endpoint = descData.data.connectAddress;
          dispatch({ type: "CLUSTER_READY", endpoint: endpoint! });
          break;
        }
      }
    }

    if (signal.aborted || !endpoint) return;

    // --- Step 4: Create collection ---
    if (!state.collectionCreated) {
      dispatch({ type: "SET_PHASE", phase: "creating-collection" });

      const collectionName = state.collectionName || `col_${shortId()}`;
      const collRes = await fetch("/api/collections/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          endpoint: endpoint.startsWith("https://")
            ? endpoint
            : `https://${endpoint}`,
          collectionName,
        }),
        signal,
      });

      const collData = await collRes.json();
      if (
        !collRes.ok ||
        (collData.code && collData.code !== 0 && collData.code !== 200)
      ) {
        throw new Error(collData.message || "Failed to create collection");
      }

      dispatch({ type: "COLLECTION_CREATED", collectionName });
    }
  } catch (err) {
    if (signal.aborted) return;
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    dispatch({ type: "PROVISIONING_ERROR", error: message });
  }
}

// --- Hook ---

export function useProvisioning() {
  // Always start from initialState so the first client render matches SSR.
  // Persisted state is restored in the mount effect below (HYDRATE), avoiding
  // a hydration mismatch when sessionStorage holds non-default state.
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: "HYDRATE", state: saved });
  }, []);

  useEffect(() => {
    if (state.startTrigger === 0) return;

    const controller = new AbortController();
    const currentState = stateRef.current;
    runProvisioning(
      currentState.apiKey,
      currentState,
      dispatch,
      controller.signal
    );

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startTrigger]);

  useEffect(() => {
    if (state.provisioningPhase !== "done") return;
    const timer = setTimeout(
      () => dispatch({ type: "ADVANCE_TO_DEMO" }),
      1000
    );
    return () => clearTimeout(timer);
  }, [state.provisioningPhase]);

  const setApiKey = useCallback(
    (apiKey: string, mode: ProvisioningMode = "create", endpoint?: string) =>
      dispatch({ type: "SET_API_KEY", apiKey, mode, endpoint }),
    []
  );

  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);

  const retry = useCallback(() => dispatch({ type: "RETRY" }), []);

  const switchToExisting = useCallback(
    () => dispatch({ type: "SWITCH_TO_EXISTING" }),
    []
  );

  return { state, setApiKey, goBack, retry, switchToExisting };
}
