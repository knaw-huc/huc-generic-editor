import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";


export function useProfiles() {
    return queryOptions({
        queryKey: ['profiles'],
        queryFn: async () => {
            const response = await fetchAuthenticated(BASE_URL + "/profiles/")
            return await response.json()
        }
    })
}
