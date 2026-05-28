import { ZillizClient, ZillizResponse } from "./client";

const CONTROL_PLANE_URL =
  process.env.NEXT_PUBLIC_ZILLIZ_API_URL ||
  "https://api.cloud.zilliz.com";

export interface CreateFreeClusterParams {
  clusterName: string;
  projectId: string;
  regionId?: string;
}

export interface ProjectData {
  projectName: string;
  projectId: string;
  instanceCount: number;
  createTime: string;
  plan: string;
  regionIds: string[];
  [key: string]: unknown;
}

export interface CreateFreeClusterData {
  clusterId: string;
  username: string;
  password: string;
  prompt: string;
}

export interface DescribeClusterData {
  clusterId: string;
  clusterName: string;
  projectId: string;
  regionId: string;
  plan: string;
  status: string;
  connectAddress: string;
  cuSize: number;
  storageSize: number;
  createTime: string;
  [key: string]: unknown;
}

export class ClusterApi {
  private client: ZillizClient;

  constructor(apiKey: string) {
    this.client = new ZillizClient(CONTROL_PLANE_URL, apiKey);
  }

  createFreeCluster(
    params: CreateFreeClusterParams
  ): Promise<ZillizResponse<CreateFreeClusterData>> {
    return this.client.post<CreateFreeClusterData>(
      "/v2/clusters/createFree",
      params
    );
  }

  describeCluster(
    clusterId: string
  ): Promise<ZillizResponse<DescribeClusterData>> {
    return this.client.get<DescribeClusterData>(
      `/v2/clusters/${clusterId}`
    );
  }

  listProjects(): Promise<ZillizResponse<ProjectData[]>> {
    return this.client.get<ProjectData[]>("/v2/projects");
  }

  createProject(params: {
    projectName: string;
    regionIds: string[];
    plan: string;
  }): Promise<ZillizResponse<string>> {
    return this.client.post<string>("/v2/projects", params);
  }
}
