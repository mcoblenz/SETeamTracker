import { PrismaClient } from '@prisma/client'
import { Form, json, redirect, useLoaderData } from '@remix-run/react';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import { getSession } from '~/services/session.server';
import { currentWeek } from '~/services/server';
import { useState } from 'react';

type PeerFeedback = {
    forUserID: number,
    independenceContributions: string,
    independenceGrowth: string,
    technicalContributions: string,
    technicalGrowth: string,
    teamworkContributions: string,
    teamworkGrowth: string
};

type LoaderData = { teammates: Teammate[], existingReport: any, existingPeerFeedback: PeerFeedback[] };

type Teammate = { name: string, id: number };

async function getUserID(request: Request) {
    const session = await getSession(
        request.headers.get("Cookie")
    );

    const user = session.get('user');
    if (user == undefined) {
        return redirect('/noAccess');
    }

    const prisma = new PrismaClient();
    const userRecord = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (userRecord == null) {
        console.log("UserID not found for email: " + user.email);
        return redirect('/noAccess');
    }
    return userRecord.id;
}

async function getTeammateIDs(request: Request): Promise<number[]> {
    const session = await getSession(
        request.headers.get("Cookie")
    );

    const user = session.get('user');
    if (user == undefined) {
        return [];
    }

    const prisma = new PrismaClient();
    const userRecord = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (userRecord == null) {
        console.log("UserID not found for email: " + user.email);
        return [];
    }

    const team = userRecord.team;

    const teammates = await prisma.user.findMany({
        where: {
            team: team,
            droppedCourse: false
        },
        select: {
            id: true,
        }
    });

    return teammates.map(teammate => teammate.id);
}

export const loader: LoaderFunction = async ({ request }) => {
    // Get data for all the user's team members.
    const session = await getSession(
        request.headers.get("Cookie")
    );

    const user = session.get('user');
    if (user == undefined) {
        return redirect('/noAccess');
    }

    const prisma = new PrismaClient();
    const userRecord = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (userRecord == null) {
        console.log("UserID not found for email: " + user.email);
        return redirect('/noAccess');
    }

    const team = userRecord.team;

    const teammates = await prisma.user.findMany({
        where: {
            team: team,
            droppedCourse: false
        },
        select: {
            name: true,
            id: true,
        }
    })

    const week = currentWeek();

    const existingReport = await prisma.weeklyReport.findUnique({
        where: {
            week_authorID:
            {
                week: week,
                authorID: userRecord.id,
            },
        },
        select: {
            continueDoing: true,
            startDoing: true,
            stopDoing: true,
            contributions: true,
            challenges: true
        }
    });

    const existingPeerFeedback = await prisma.peerFeedback.findMany({
        where: {
            byUserID: userRecord.id,
            week: week,
        },
        select: {
            forUserID: true,
            independenceContributions: true,
            independenceGrowth: true,
            technicalContributions: true,
            technicalGrowth: true,
            teamworkContributions: true,
            teamworkGrowth: true
        }
    });

    return {
        teammates: teammates,
        existingReport: existingReport,
        existingPeerFeedback: existingPeerFeedback
    };
}

export const action: ActionFunction = async ({ request }) => {
    // Process form data and perform necessary actions
    const prisma = new PrismaClient();
    const userID = await getUserID(request) as number;


    const body = await request.formData();
    const continueDoing = body.get('continue-doing')?.toString();
    const startDoing = body.get('start-doing')?.toString();
    const stopDoing = body.get('stop-doing')?.toString();
    const contributions = body.get('contributions')?.toString();
    const challenges = body.get('challenges')?.toString();

    const week = currentWeek();

    await prisma.weeklyReport.upsert({
        where: {
            week_authorID:
            {
                week: week,
                authorID: userID,
            }
        },
        update: {
            continueDoing: continueDoing,
            startDoing: startDoing,
            stopDoing: stopDoing,
            contributions: contributions,
            challenges: challenges
        },
        create: {
            week: week,
            authorID: userID,
            continueDoing: continueDoing,
            startDoing: startDoing,
            stopDoing: stopDoing,
            contributions: contributions,
            challenges: challenges
        }
    });


    const teammateIDs = await getTeammateIDs(request);
    teammateIDs.forEach(async (teammateID: number) => {
        const IC = body.get('IC' + String(teammateID));
        const IG = body.get('IG' + String(teammateID));
        const TC = body.get('TC' + String(teammateID));
        const TG = body.get('TG' + String(teammateID));
        const TEC = body.get('TEC' + String(teammateID));
        const TEG = body.get('TEG' + String(teammateID));

        await prisma.peerFeedback.upsert({
            where: {
                forUserID_byUserID_week: {
                    forUserID: teammateID,
                    byUserID: userID,
                    week: week
                }
            },
            update: {
                independenceContributions: IC,
                independenceGrowth: IG,
                technicalContributions: TC,
                technicalGrowth: TG,
                teamworkContributions: TEC,
                teamworkGrowth: TEG
            },
            create: {
                week: week,
                byUserID: userID,
                forUserID: teammateID,
                independenceContributions: IC,
                independenceGrowth: IG,
                technicalContributions: TC,
                technicalGrowth: TG,
                teamworkContributions: TEC,
                teamworkGrowth: TEG
            }
        });
    });


    return json({ success: true });
};



export default function Report() {
    const loaderData: LoaderData = useLoaderData() as LoaderData;
    const teammates: Array<Teammate> = loaderData.teammates;
    const existingReport = loaderData.existingReport
    const existingPeerFeedback = loaderData.existingPeerFeedback ? loaderData.existingPeerFeedback : [];

    const existingPeerFeedbackMap = new Map();
    existingPeerFeedback.forEach((feedback: PeerFeedback) => {
        existingPeerFeedbackMap.set(feedback.forUserID, feedback);
    });

    const [showFormSubmitted, setShowFormSubmitted] = useState(false);

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // event.preventDefault();
        setShowFormSubmitted(true);
        setTimeout(() => {
            setShowFormSubmitted(false);
        }, 1000);
    }

    return (
        <Form method="post" action="." navigate={false} onSubmit={handleFormSubmit}>
            <div><h1>Weekly Report</h1>
                <div className="p-4">
                    <h2>Team</h2>
                    <table>
                        <tbody>
                            <tr><td>What should your team CONTINUE doing?</td><td><input type="text" name="continue-doing" defaultValue={existingReport ? existingReport.continueDoing : ""} className="w-96" /></td></tr>

                            <tr><td>What should your team START doing?</td><td><input type="text" name="start-doing" defaultValue={existingReport ? existingReport.startDoing : ""} className="w-96" /></td></tr>

                            <tr><td>What should your team STOP doing?</td><td><input type="text" name="stop-doing" defaultValue={existingReport ? existingReport.stopDoing : ""} className="w-96" /></td></tr>

                            <tr><td>What were your main contributions this week?</td><td><input type="text" name="contributions" defaultValue={existingReport ? existingReport.contributions : ""} className="w-96" /></td></tr>

                            <tr><td>What key challenges did you face this week?</td><td><input type="text" name="challenges" defaultValue={existingReport ? existingReport.challenges : ""} className="w-96" /></td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="p-4">
                    <h3>In each area, describe each team member's contributions and areas of growth.</h3>

                    <div className="p-4">
                        <h3> Independence and Leadership </h3>
                        Contributing leadership or exercising independent judgment

                        <table>
                            <thead>
                                <tr><th></th><th>Contributions</th><th>Areas of growth</th></tr>
                            </thead>
                            <tbody>
                                {teammates.map(teammate => (
                                    <tr key={String(teammate.id)}>
                                        <td><label className="pr-2">{teammate.name}</label></td><td>< input name={"IC" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.independenceContributions} className="w-96" /></td>
                                        <td>< input name={"IG" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.independenceGrowth} className="w-96" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4">
                        <h3> Technical contributions </h3>
                        Driving the project forward by contributing artifacts

                        <table>
                            <thead>
                                <tr><th></th><th>Contributions</th><th>Areas of growth</th></tr>
                            </thead>
                            <tbody>
                                {teammates.map(teammate => (
                                    <tr key={String(teammate.id)}>
                                        <td><label className="pr-2">{teammate.name}</label></td><td>< input name={"TC" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.technicalContributions} className="w-96" /></td>
                                        <td>< input name={"TG" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.technicalGrowth} className="w-96" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4">
                        <h3> Teamwork </h3>
                        Collaborating positively, communicating effectively.

                        <table>
                            <thead>
                                <tr><th></th><th>Contributions</th><th>Areas of growth</th></tr>
                            </thead>
                            <tbody>
                                {teammates.map(teammate => (
                                    <tr key={String(teammate.id)}>
                                        <td><label className="pr-2">{teammate.name}</label></td><td>< input name={"TEC" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.teamworkContributions} className="w-96" /></td>
                                        <td>< input name={"TEG" + String(teammate.id)} defaultValue={existingPeerFeedbackMap.get(teammate.id)?.teamworkGrowth} className="w-96" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >



            <button type="submit" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={showFormSubmitted}>{showFormSubmitted ? "Saved" : "Save"}</button>
        </Form >
    );
}