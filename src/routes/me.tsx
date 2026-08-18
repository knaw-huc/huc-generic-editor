import { createFileRoute } from '@tanstack/react-router'

// import {type User} from "./users.tsx";
import {useMe} from "../queries/me.ts";
import {useMutation, useSuspenseQuery} from "@tanstack/react-query";
// import {createColumnHelper} from "@tanstack/react-table";
import { useState } from "react";
import {Button} from "react-aria-components";
import {fetchAuthenticated} from "../auth.ts";





export const Route = createFileRoute("/me")({
    component: Me,
    loader: ({context}) => {
        context.queryClient.ensureQueryData(useMe())
    }
});


export default function Me(){


    const {data: user} = useSuspenseQuery(useMe());

    const [password, setPassword] = useState("");

    const changePassword = useMutation({
        mutationFn: async ({userId, password}:{userId: number;
        password: string}) => {
            const response = await fetchAuthenticated(
                `http://localhost:1210/app/tastadev1/auth/users/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        new_password: password,
                    }),
                }
            );

                    return response.json();
                },

                onSuccess: () => {
                setPassword("");
            },
        });





    return (


        <main>
            <div>
                <p>current user information:</p>
            <p>ID: {user.id}</p>
            <p>Name: {user.name}</p>
        </div>

            <div>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                />


                <Button
                    onPress={() =>
                        changePassword.mutate({
                            userId: user.id,
                            password: password,
                        })
                    }
                    isDisabled={
                        password.trim() === "" || changePassword.isPending
                    }
                >
                    {changePassword.isPending ? "Changing..." : "Change password"}
                </Button>



            </div>


        </main>
    );



}

