import { PrismaClient } from "@prisma/client";
import { createReadableStreamFromReadable, LoaderFunction } from "@remix-run/node";
import { Readable } from "node:stream";
import { redirectIfNotAdmin } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    // Get data for all the user's team members.

    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }

    const prisma = new PrismaClient();
    const data = await prisma.staffFeedback.findMany({
        select: {
            user: {
                select: {
                    email: true,
                },
            },
            week: true,
            independence: true,
            technical: true,
            teamwork: true,
            comments: true
        },
    })

    const csvList: Array<string> = data.map((val) =>
        [val.user.email,
        val.week,
        val.independence ? val.independence : "",
        val.technical ? val.technical : "",
        val.teamwork ? val.teamwork : "",
        val.comments ? val.comments : ""].join()
    );

    const header = "Email,week,independence,technical,teamwork,comments";

    const csv = header + "\n" + csvList.join("\n");

    const file = createReadableStreamFromReadable(
        Readable.from(csv),
    );

    return new Response(file, {
        headers: {
            'Content-Disposition': 'attachment; filename="scores.csv"',
            'Content-Type': 'text/csv',
        },
    });
}