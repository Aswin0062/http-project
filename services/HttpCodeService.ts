import { IHttpCodeDao } from "@/dao";

export const HttpCodeService = {
    getAll: async (filter: string): Promise<IHttpCodeDao[]> => {
        try {
            const response = await fetch(`/api/httpCodes${filter ? `?code=${encodeURIComponent(filter)}` : ''}`, { method: 'GET', headers: { "Content-Type": "application/json" } });
            return await response.json();
        } catch (error) {
            console.error(`Failed to get http codes due to: ${error}`);
        }
        return [];
    }
}