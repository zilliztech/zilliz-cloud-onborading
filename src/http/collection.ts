import { ZillizClient, ZillizResponse } from "./client";

// Schema-based collection creation params
export interface CollectionSchema {
  autoId: boolean;
  enableDynamicField: boolean;
  fields: SchemaField[];
  functions?: SchemaFunction[];
}

export interface SchemaField {
  fieldName: string;
  dataType: string;
  isPrimary?: boolean;
  isPartitionKey?: boolean;
  elementDataType?: string;
  elementTypeParams?: Record<string, string>;
}

export interface SchemaFunction {
  name: string;
  type: string;
  inputFieldNames: string[];
  outputFieldNames: string[];
}

export interface IndexParam {
  fieldName: string;
  indexName: string;
  metricType?: string;
  params?: Record<string, unknown>;
}

export interface CreateCollectionParams {
  collectionName: string;
  schema: CollectionSchema;
  indexParams: IndexParam[];
}

export class CollectionApi {
  private client: ZillizClient;

  constructor(clusterEndpoint: string, apiKey: string) {
    this.client = new ZillizClient(clusterEndpoint, apiKey);
  }

  createCollection(
    params: CreateCollectionParams
  ): Promise<ZillizResponse> {
    return this.client.post(
      "/v2/vectordb/collections/create",
      params
    );
  }
}

// Pre-built schema for the onboarding demo collection
export const ONBOARDING_SCHEMA: CollectionSchema = {
  autoId: false,
  enableDynamicField: true,
  fields: [
    {
      fieldName: "id",
      dataType: "Int64",
      isPrimary: true,
    },
    {
      fieldName: "dense",
      dataType: "FloatVector",
      elementTypeParams: { dim: "1536" },
    },
    {
      fieldName: "text",
      dataType: "VarChar",
      elementTypeParams: { max_length: "8192", enableAnalyzer: "true", enableMatch: "true" },
    },
    {
      fieldName: "source",
      dataType: "VarChar",
      elementTypeParams: { max_length: "256" },
    },
    {
      fieldName: "chunk_id",
      dataType: "Int64",
    },
    {
      fieldName: "visibility",
      dataType: "VarChar",
      elementTypeParams: { max_length: "64" },
    },
  ],
};

export const ONBOARDING_INDEX_PARAMS: IndexParam[] = [
  {
    fieldName: "dense",
    indexName: "dense_index",
    metricType: "COSINE",
    params: { index_type: "AUTOINDEX" },
  },
];
