import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";

export function useMe() {
    return queryOptions({
        queryKey: [],
        queryFn: async () => {
            const response = await fetchAuthenticated(`${BASE_URL}/auth/me`)
            return await response.json()
        }
    })
}