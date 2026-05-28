interface DemoContentStepProps {
  clusterEndpoint: string;
  clusterUsername: string;
  clusterPassword: string;
}

export function DemoContentStep({
  clusterEndpoint,
  clusterUsername,
  clusterPassword,
}: DemoContentStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-black-1">
          Your Environment is Ready
        </h2>
        <p className="mt-2 text-sm text-black-2">
          Your free cluster and demo collection have been created successfully.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-badge border border-green-3 bg-green-4 px-4 py-3 text-sm text-green-1">
        <div>
          Cluster endpoint: <strong>{clusterEndpoint}</strong>
        </div>
        <div>
          Username: <strong>{clusterUsername}</strong>
        </div>
        <div>
          Password: <strong>{clusterPassword}</strong>
        </div>
      </div>

      <div className="rounded-badge border border-dashed border-stroke-2 bg-black-5 px-6 py-12 text-center text-sm text-black-3">
        Demo content coming soon...
      </div>
    </div>
  );
}
