import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useState} from "react";
import {BASE_URL} from "../config.ts";

export const Route = createFileRoute('/login')({
    component: LoginRouteComponent,
})


function LoginRouteComponent() {

    const rememberedUser: string = localStorage.getItem("remembered_user") ?? ""
    const [username, setUsername] = useState<string>(rememberedUser)
    const [password, setPassword] = useState<string>('')
    const [remember, setRemember] = useState<boolean>(localStorage.getItem("remembered_user") != null)
    const message = localStorage.getItem("login_message")
    const navigate = useNavigate();

    async function login() {
        console.log("login", username, password)
        const data = new FormData();
        data.append("username", username)
        data.append("password", password)

        const response = await fetch(BASE_URL + "/auth/token", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
            },
            body: data
        })


        const json = await response.json();

        if (response.status === 401) {
            // document.getElementById("response").setHTML(json.detail)
            return false;
        }

        if (remember) {
            localStorage.setItem("remembered_user", username)
        } else {
            localStorage.removeItem("remembered_user")
        }

        localStorage.setItem("token", json.access_token)
        localStorage.setItem("refresh", json.refresh_token)

        const redirect = localStorage.getItem("login_redirect")

        localStorage.removeItem("login_message")
        if (redirect) {
            localStorage.removeItem("login_redirect")
            // window.location.replace(redirect)
            navigate({
                to: redirect
            })
            return false;
        }
        navigate({
            to: "/"
        })



    }

    function loginSatosa(){

        const loginUrl = "http://localhost:1210/app/tastadev1/auth/satosalogin";
        window.location.href = loginUrl;

    }

    return <div>
        <div className="min-h-2/3 flex flex-col items-center justify-center">
            <div className="max-w-md w-full">
                <div
                    className="p-6 rounded-lg bg-white border border-slate-300 shadow-xs md:p-8 dark:bg-neutral-800 dark:border-neutral-700">
                    <h1 className="text-slate-900 text-center text-3xl font-bold dark:text-slate-50">Sign in</h1>

                    <form className="space-y-6 mt-10" onSubmit={e => {e.preventDefault(); login()}}>
                        <div className="text-slate-900 text-sm text-center dark:text-slate-50">{message}</div>
                        <div>
                            <label htmlFor="username"
                                   className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Email</label>
                            <input type="text" id="username" name="username" placeholder="superuser123" required value={username} onChange={(e) => setUsername(e.target.value)}
                                   className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"/>
                        </div>
                        <div>
                            <label htmlFor="password"
                                   className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Password</label>
                            <input type="password" id="password" name="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"/>
                        </div>

                        <div className="flex items-start flex-wrap gap-2">
                            <label className="flex items-center group has-[input:checked]:text-slate-900">
                                <input id="remember" name="remember" type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-600
                                 bg-white dark:bg-neutral-700
                                 group-has-[input:checked]:bg-blue-600
                                 group-has-[input:checked]:outline-blue-600
                                 group-focus-within:outline-2
                                 group-focus-within:outline-blue-600" aria-hidden="true">
                                    <svg className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100"
                                         viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="2">
                           <path d="M1 5l3 3 7-7"/>
                        </svg>
                     </span>
                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                        Remember me
                     </span>
                            </label>

                            {/*<a href="#"*/}
                            {/*   className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">*/}
                            {/*    Forgot password?*/}
                            {/*</a>*/}
                        </div>

                        <button type="submit"
                                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                            Sign in with user
                        </button>





                    </form>

                    <form className="space-y-6 mt-10" onSubmit={e => {e.preventDefault(); login()}}>


                        <button onClick={loginSatosa}
                                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                            Sign in with Satosa
                        </button>



                    </form>


                </div>


            </div>


        </div>
    </div>
}