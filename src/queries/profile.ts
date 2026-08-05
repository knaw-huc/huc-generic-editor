import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";

export function useProfile(profile: string) {
    return queryOptions({
        queryKey: ['profile', profile],
        queryFn: async () => {
            const response = await fetchAuthenticated(`${BASE_URL}/profile/${profile}.json2`)
            return await response.json()
        }
    })
}