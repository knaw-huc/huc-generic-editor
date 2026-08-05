import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";


export function useRecords(profile: string) {
    return queryOptions({
        queryKey: ['records', profile],
        queryFn: async () => {
            const response = await fetchAuthenticated(BASE_URL + "/profile/" + profile + "/records/")
            return await response.json()
        }
    })
}