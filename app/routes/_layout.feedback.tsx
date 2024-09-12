import { PrismaClient } from '@prisma/client'
import { redirect, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { getSession } from '~/services/session.server';

type Teammate = { name: string, id: number };

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

    const team = userRecord.team;

    const teammates = await prisma.user.findMany({
        where: {
            team: team
        },
        select: {
            name: true,
            id: true,
        }
    })
    console.log("teammates: ", teammates);

    return teammates;

}

export default function Feedback() {
    const teammates: Array<Teammate> = useLoaderData();

    return (
        <div><h1>My feedback</h1></div>
    );
}