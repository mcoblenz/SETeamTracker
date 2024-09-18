import { LoaderFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { redirectIfNotAdmin } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }


    return null;
}

export default function ImportRoster() {
    const actionData = useActionData<string>();

    return (
        <div><h1>Import team roster</h1>

            <div className="space-y-4" >
                <p />Choose file. File should be tab-delimited and have the following fields:<br />
                Sec ID	PID	Student	Pronoun	Credits	College	Major	Level	Email   Team

                <div>
                    <p>To obtain this file, export the standard roster from Blink and append a column called "Team."</p>
                </div>
                <div>
                    <Form method="post" action="/importComplete" encType="multipart/form-data">
                        <>
                            <input name="file" type="file" />
                            {actionData}
                            <input value="Upload" type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" />
                        </>
                    </Form>
                </div>
            </div>
        </div >
    );
}