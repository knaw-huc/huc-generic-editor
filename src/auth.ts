import {BACKEND_URL, BASE_URL} from "./config.ts";
import {getRouteApi} from "@tanstack/react-router";
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';


const routeApi = getRouteApi('/');

export async function getToken() {
    console.log("Get token")

    let token;

    await navigator.locks.request("token", async () => {
        token = localStorage.getItem("token");
        if (!token) {
            return token
        }
        const body = JSON.parse(atob(token.split(".")[1]))
        const expDate = body.exp * 1000

        const valid = expDate > Date.now()

        if (!valid) {
            console.log("Token expired.. refreshing")
            token = await refreshToken()
        }
    })

    return token
}

async function refreshToken() {
    const refresh = localStorage.getItem("refresh");

    const response = await fetch(BASE_URL + "/auth/refresh", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refresh_token: refresh
        })
    })

    console.log(response)

    if (response.status !== 200) {
        goToLogin("Your session has expired.")
        return null;
    }
    const json = await response.json()

    localStorage.setItem("token", json.access_token)
    localStorage.setItem("refresh", json.refresh_token)

    return json.access_token
}

function goToLogin(message: string) {
    console.log("Go to login page, message: ", message)
    localStorage.setItem("login_message", message)
    localStorage.setItem("login_redirect", window.location.pathname)

    throw routeApi.redirect({
        to: "/login",
    })
}

export async function fetchAuthenticated(input: RequestInfo | URL, init: RequestInit = {}) {
    const token = await getToken()

    if (token) {
        if (!init.headers) {
            init.headers = {"Authorization": "Bearer " + token}
        } else {
            // @ts-ignore
            init.headers.Authorization = "Bearer " + token
        }
    }

    const response = await fetch(input, init)

    if (response.status === 401) {
        goToLogin("You need to log in to view this page")
    }

    return response
}

export async function openSigned(url: string, newTab = false) {
    const response = await fetchAuthenticated(BASE_URL + "/auth/sign", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: url
        })
    })
    const jsonBody = await response.json()
    const signedUrl = `${BACKEND_URL}${jsonBody.url}`

    if (newTab) {
        window.open(signedUrl, "_blank")?.focus()
    } else {
        window.location.replace(signedUrl)
    }
}


