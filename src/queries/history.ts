import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";

export function useHistory(profile: string, recordId: string) {
    return queryOptions({
        queryKey: ['history', profile, recordId],
        queryFn: async () => {
            const response = await fetchAuthenticated(`${BASE_URL}/profile/${profile}/record/${recordId}/history`);
            return await response.json()
        }
    })
}