import { TResultResponse, TSavedFilter, TSavedFilterRequest, TSavedFilterUpdate } from "@/dao";

export const SavedFilterService = {
    saveFilter: async (name: string, query: string, codes: string[]): Promise<TResultResponse | null> => {
        try {
            const response = await fetch('/api/savedFilters', {
                method: 'POST',
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ name, query, codes } as TSavedFilterRequest)
            });
            return await response.json() as TResultResponse;
        } catch (error) {
            console.error(`Failed to save filter due to ${error}`);
        }
        return null;
    },

    getAll: async (): Promise<TSavedFilter[]> => {
        try {
            const response = await fetch('/api/savedFilters');
            return await response.json() as TSavedFilter[];
        } catch (error) {
            console.error(`Failed to get all saved filters due to ${error}`);
        }
        return [];
    },

    getById: async (id: string): Promise<TSavedFilter | null> => {
        try {
            const response = await fetch(`/api/savedFilters/${id}`);
            return await response.json() as TSavedFilter;
        } catch (error) {
            console.error(`Failed to get saved filter for ${id} due to ${error}`);
        }
        return null;
    },

    deleteById: async (id: string): Promise<TResultResponse> => {
        try {
            const response = await fetch(`/api/savedFilters/${id}`, { method: 'DELETE' });
            return await response.json() as TResultResponse;
        } catch (error) {
            console.error(`Failed to delete saved filter for ${id} due to ${error}`);
        }
        return { message: 'Please Try again later', result: false };
    },

    updateById: async (id: string, updatedFilter: TSavedFilter): Promise<TSavedFilterUpdate | null> => {
        try {
            const response = await fetch(`/api/savedFilters/${id}`, {
                method: 'PUT', headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ name: updatedFilter.name, query: updatedFilter.query, codes: updatedFilter.httpCodes?.map(({ id }) => id) } as TSavedFilterRequest)
            });
            return await response.json() as TSavedFilterUpdate;
        } catch (error) {
            console.error(`Failed to update saved filter for ${id} due to ${error}`);
        }
        return { errorMessage: 'Please Try again later', result: false };
    }
}