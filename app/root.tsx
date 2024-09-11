import {
    Links,
    Link,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    LiveReload,
} from "@remix-run/react";
import "./tailwind.css";

import {
    useRouteError, isRouteErrorResponse
} from "@remix-run/react";


import pkg from 'react-burger-menu';
import { authenticator } from "./services/auth.server";
import { LoaderFunction } from "@remix-run/node";

const { slide } = pkg;
const Slide = slide; // TS wants the name capitalized!

export const loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request);
}

// export function Layout({ children }: { children: React.ReactNode }) {
//     return (
//         <html lang="en">
//             <head>
//                 <meta charSet="utf-8" />
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <Meta />
//                 <Links />
//             </head>
//             <body>
//                 {children}
//                 <ScrollRestoration />
//                 <Scripts />
//             </body>
//         </html>
//     );
// }


export default function App() {

    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        // error is type `ErrorResponse`
        errorMessage = error.data || error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    console.log(errorMessage);

    return (
        <html lang="en-US">
            <head>
                <title>Oh no!</title>
                <Meta />
                <Links />
            </head>
            <body>
                {errorMessage}
                <Scripts />
            </body>
        </html>
    );
}