import { LoaderFunction } from "@remix-run/node";
import { redirectIfNotAdmin } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    // Get data for all the user's team members.

    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }


    return null;
}


export default function DownloadScores() {
    return (
        <h1>Download scores</h1>
    );
}