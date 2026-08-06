import {queryOptions} from "@tanstack/react-query";
import {fetchAuthenticated} from "../auth.ts";
import {BASE_URL} from "../config.ts";

export function useUsers() {
    return queryOptions({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetchAuthenticated(`${BASE_URL}/auth/users`)
            return await response.json()
        }
    })
}