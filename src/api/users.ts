import type { AnaplanClient } from "./client.js";

export class UsersApi {
  constructor(private client: AnaplanClient) {}

  async getCurrentUser() {
    const res = await this.client.get<any>("/users/me");
    return res.user ?? res;
  }

  async get(userId: string) {
    const res = await this.client.get<any>(`/users/${userId}`);
    return res.user ?? res;
  }

  async list(sort?: string) {
    const suffix = sort ? `?sort=${sort}` : "";
    return this.client.getAll<any>(`/users${suffix}`, ["users", "user"]);
  }
}
