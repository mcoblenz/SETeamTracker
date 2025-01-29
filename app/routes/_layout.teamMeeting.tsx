import { PrismaClient } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useOutlet } from "@remix-run/react";
import { redirectIfNotAdmin } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const prisma = new PrismaClient();

    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }

    const teams = await prisma.user.findMany({
        where: {
	    team: {
			gte: 0,
	    	  },
	    },
        distinct: ['team'],
        select: {
            team: true
        },
        orderBy: {
            team: 'asc'
        }
    })

    return {
        teams: teams.map(team => team.team),
    };
};

export default function TeamMeeting() {
    const { teams }: { teams: string[] } = useLoaderData();
    const outlet = useOutlet();

    return (
        <div className="space-y-4">
            <h1>Team Meeting</h1>
            <div className="grid grid-flow-col auto-cols-max space-x-2">
                <div className="bg-blue-200 w-40 space-y-1">
                    {teams.map(team => (
                        <p key={team}><Link to={"/teamMeeting/" + encodeURIComponent(team)} className="underline font-medium"> {team}</Link></p >
                    ))
                    }
                </div >
                <div className="col-span-1">
                    {outlet || <div>Select a team.</div>}
                </div>
            </div>
        </div>
    )
}