import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface ZillizResponse<T = unknown> {
  code: number;
  message?: string;
  data: T;
}

export class ZillizClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async request<T = unknown>(
    config: AxiosRequestConfig
  ): Promise<ZillizResponse<T>> {
    const res: AxiosResponse<ZillizResponse<T>> =
      await this.instance.request(config);
    const body = res.data;

    if (body.code !== 0 && body.code !== 200) {
      throw new Error(
        `Zilliz API error [${body.code}]: ${body.message ?? "unknown error"}`
      );
    }

    return body;
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: "GET", url });
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.request<T>({ ...config, method: "POST", url, data });
  }
}
