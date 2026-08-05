import * as React from 'react'
import {Outlet, createRootRoute, Link, Navigate} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: RootComponent,
    errorComponent: (err) => {
        console.log(err)
        if (err.error instanceof Response) {
            console.log("this is a redirect")
            return <Navigate to={err.error.options.to} />
        }
        return <h1>Error</h1>
    }
})

function RootComponent() {
    return (
        <>
            {/*<header className="border-b py-4 px-4 sm:px-10 bg-white font-sans min-h-[70px]">*/}
            {/*    <nav className={"flex flex-wrap items-center lg:gap-y-2 gap-y-4 gap-x-4"}>*/}
            {/*        <ul className={"flex lg:ml-10 lg:space-x-8 max-lg:space-y-2 max-lg:block max-lg:w-full"}>*/}
            {/*            <li className={"max-lg:border-b max-lg:py-2"}>*/}
            {/*                <Link*/}
            {/*                    to="/"*/}
            {/*                    activeProps={{*/}
            {/*                        className: 'font-bold',*/}
            {/*                    }}*/}
            {/*                    activeOptions={{exact: true}}*/}
            {/*                >*/}
            {/*                    Home*/}
            {/*                </Link>*/}
            {/*            </li>*/}
            {/*            <li className={"max-lg:border-b max-lg:py-2"}>*/}
            {/*                <Link*/}
            {/*                    to="/users"*/}
            {/*                    activeProps={{*/}
            {/*                        className: 'font-bold',*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    Users*/}
            {/*                </Link>*/}
            {/*            </li>*/}
            {/*        </ul>*/}
            {/*    </nav>*/}
            {/*</header>*/}
            <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6 mb-4">
                <div className="block lg:hidden">
                    <button
                        className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white">
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>Menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
                        </svg>
                    </button>
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                        <Link
                            to="/"
                            className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4"
                            activeProps={{
                                className: 'font-bold',
                            }}
                            activeOptions={{exact: true}}
                        >
                            Home
                        </Link>
                        <Link
                            to="/users"
                            className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4"
                            activeProps={{
                                className: 'font-bold',
                            }}
                        >
                            Users
                        </Link>
                    </div>
                </div>
            </nav>
            <main className={"container mx-auto px-4"}>
                <Outlet/>
            </main>
            <TanStackRouterDevtools position="bottom-right"/>
        </>
    )
}
