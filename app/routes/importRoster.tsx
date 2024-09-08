import { Form, useActionData } from "@remix-run/react";

export default function ImportRoster() {
    const actionData = useActionData<string>();

    return (
        <div>Choose file. File should be tab-delimited and have the following fields:
            <p />Sec ID	PID	Student	Pronoun	Credits	College	Major	Level	Email   Team

            <p /> To obtain this file, export the standard roster from Blink and append a column called "Team."
            <Form method="post" action="/importComplete" encType="multipart/form-data">
                <>
                    <input name="file" type="file" />
                    {actionData}
                    <input value="Upload" type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" />
                </>
            </Form>
        </div>
    );
}