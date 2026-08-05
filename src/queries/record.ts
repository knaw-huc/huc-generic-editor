import {queryOptions} from "@tanstack/react-query";
import {BASE_URL} from "../config.ts";
import {fetchAuthenticated} from "../auth.ts";

export function useRecord(profile: string, recordId: string) {
    return queryOptions({
        queryKey: ['record', profile, recordId],
        queryFn: async () => {
            const response = await fetchAuthenticated(`${BASE_URL}/profile/${profile}/record/${recordId}.json2`)
            return await response.json()
        }
    })
}