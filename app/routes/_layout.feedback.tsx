import { PrismaClient } from '@prisma/client'
import { redirect, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { getSession } from '~/services/session.server';
import { FeedbackLoaderData, getUserFeedback } from '~/services/server';
import { PeerFeedback } from '~/components/feedback';



export const loader: LoaderFunction = async ({ request }) => {
    // Get data for all the user's team members.

    const session = await getSession(
        request.headers.get("Cookie")
    );

    const user = session.get('user');
    if (user == undefined) {
        return redirect('/');
    }

    const prisma = new PrismaClient();

    const userRecord = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (userRecord == null) {
        console.log("UserID not found for email: " + user.email);
        return redirect('/');
    }

    return getUserFeedback(userRecord.id);
}

export default function Feedback() {
    const loaderData: FeedbackLoaderData = useLoaderData();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const reportErrorStatus = (_isError: boolean) => {
        // nothing to do here
    }

    return (<><h1>My feedback</h1>
        <PeerFeedback feedbackData={loaderData} isAdmin={false} reportErrorStatus={reportErrorStatus} />
    </>);
}