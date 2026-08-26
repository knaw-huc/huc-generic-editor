import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {useEffect} from "react";

export const Route = createFileRoute('/redirect')({
    validateSearch: (search: Record<string, unknown>) => ({

        token: String(search.access_token ?? ""),
        refresh: String(search.refresh_token ?? ""),
        nickname: String(search.nickname ?? ""),

    }),

    component: RouteComponent,
});

async function RouteComponent() {

    const navigate = useNavigate();

    const { token, refresh, nickname } = Route.useSearch();

    console.log(nickname);

    // const user = {nickname}

    useEffect(() => {

        console.log("Logged in!");

        localStorage.setItem("token", token);
        localStorage.setItem("refresh", refresh);

        const user = {

            nickname,

        };


        localStorage.setItem("user", JSON.stringify(user));

        navigate({ to: "/" });
    }, [nickname,
        token,
        refresh,
        navigate]);


    return <div>Logging in...</div>;


}



