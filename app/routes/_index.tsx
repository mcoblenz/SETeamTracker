import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });
};

export default function Index() {
    const data = useLoaderData();
    console.log(data);

    return (<div>Please choose a command from the menu.</div>);
}