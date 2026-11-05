import { api } from "../../boot/api";
import type { UserSearchResult } from "../../types/users";

export const usersService = {
    async search(query: string) {
        return (await api.get<{ data: UserSearchResult[] }>("/api/v1/users/search", { params: { q: query } })).data.data;
    },
};
