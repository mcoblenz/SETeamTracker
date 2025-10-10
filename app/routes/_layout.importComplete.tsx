import { ActionFunctionArgs, json, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client'
import { useActionData } from "@remix-run/react";
import { redirectIfNotAdmin } from "~/services/auth.server";

const prisma = new PrismaClient();

export const action = async ({
    params,
    request,
}: ActionFunctionArgs) => {
    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }


    const uploadHandler = unstable_createMemoryUploadHandler({
        maxPartSize: 500_000,
    });

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const uploadedFile = formData.get("file") as File;
    if (uploadedFile == undefined) {
        return json({ error: "No file uploaded" });
    }
    else {
        const fileContents = await uploadedFile.text();
        // Skip to the first line of data.
        const headerIndex = fileContents?.indexOf('Sec ID');
        if (headerIndex == undefined) {
            return json({ error: "File is missing header row" });
        }
        const firstRecordIndex = fileContents?.indexOf('\n', headerIndex + 1);

        if (firstRecordIndex == undefined) {
            return json({ error: "File is missing data rows" });
        }

        const records = fileContents?.slice(firstRecordIndex + 1);
        if (records == undefined) {
            return json({ error: "File is missing data rows" });
        }

        const parser = parse(records, { delimiter: "\t" });

        let numRecords = 0;
        let errors = false;
        try {
            for await (const record of parser) {
                if (record.length < 9) {
                    console.log("error in record " + record);
                    errors = true;
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars 
                const [secID_, PID, name, pronoun, credits, college, major, level, email, team] = record;
		const teamInt = parseInt(team);
                await prisma.user.create({
                    data: {
                        email: email,
                        name: name,
                        team: teamInt,
                        isAdmin: false,
                    }
                });
                numRecords++;
            }
        }
        catch (e) {
            return json({ error: "Failed to parse file: " + e });
        }

        if (errors) {
            return json({ error: "Failed to parse data rows" });
        }
        else {
            return json({ numRecords: numRecords });
        }
    }


};

export function ErrorBoundary({ error }) {
    console.log(error);
    return (
        < div > Import failed: {error}</div >
    )
}

export default function ImportComplete() {
    const actionData = useActionData<typeof action>();

    if (actionData?.error) {
        return (
            < div > Import failed: {actionData?.error}</div >
        )
    }
    return (<div>Import complete. Imported {actionData?.numRecords} records. </div>)
}