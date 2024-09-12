import { PrismaClient } from '@prisma/client'
import { redirect, useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/node';
import { getSession } from '~/services/session.server';
import { forEach, include } from 'underscore';
import { currentWeek } from '~/services/server';

type Teammate = { name: string, id: number };

type FeedbackLoaderData = {
    currentWeek: number,
    scores: {
        week: number,
        independence: number,
        technical: number,
        teamwork: number
    }[],
    peerFeedback: {
        // Don't include byUserID here, since these are supposed to be anonymous.
        week: number,
        independenceContributions: string,
        independenceGrowth: string,
        technicalContributions: string,
        technicalGrowth: string,
        teamworkContributions: string,
        teamworkGrowth: string,
    }[]
};

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

    const scores = await prisma.staffFeedback.findMany({
        where: {
            forUserID: userRecord.id
        },
        orderBy: {
            week: 'asc'
        },
    })

    const peerFeedback = await prisma.peerFeedback.findMany({
        where: {
            forUserID: userRecord.id
        },
        orderBy: {
            week: 'asc'
        },
    });

    return {
        currentWeek: currentWeek(),
        scores: scores,
        peerFeedback: peerFeedback
    };

}

export default function Feedback() {
    const loaderData = useLoaderData() as FeedbackLoaderData;
    const scores = loaderData.scores;
    const currentWeek = Math.max(loaderData.currentWeek, 0);

    const peerFeedbackMap = new Map<number, { independenceContributions: string, independenceGrowth: string, technicalContributions: string, technicalGrowth: string, teamworkContributions: string, teamworkGrowth: string }[]>();

    // Aggregate peer feedback by week
    loaderData.peerFeedback.forEach((feedback) => {
        let weekFeedback = peerFeedbackMap.get(feedback.week);
        if (!weekFeedback) {
            weekFeedback = [];
        }
        weekFeedback.push(feedback)
        peerFeedbackMap.set(feedback.week, weekFeedback);
    });

    const strengthsByWeek = new Map<number, string[]>();
    const areasOfGrowthByWeek = new Map<number, string[]>();

    // Aggregate strengths and areas of growth by week
    peerFeedbackMap.forEach((feedback, week) => {
        // feedback is a list of feedback objects for a given week
        // We want to aggregate across the areas of strength and weakness.

        const strengths: string[] = [];
        const areasOfGrowth: string[] = [];
        feedback.forEach((f) => {
            strengths.push(f.independenceContributions);
            strengths.push(f.technicalContributions);
            strengths.push(f.teamworkContributions);
            areasOfGrowth.push(f.independenceGrowth);
            areasOfGrowth.push(f.technicalGrowth);
            areasOfGrowth.push(f.teamworkGrowth);
        });

        strengthsByWeek.set(week, strengths);
        areasOfGrowthByWeek.set(week, areasOfGrowth);
    });

    return (
        <div><h1>My feedback</h1>

            <h2>Staff feedback</h2>
            <table>
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Leadership and independence</th>
                        <th>Technical contributions</th>
                        <th>Teamwork</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((score) => {
                        const total = score.independence + score.technical + score.teamwork;
                        return (
                            <tr key={score.week}>
                                <td>{score.week}</td>
                                <td>{score.independence}</td>
                                <td>{score.technical}</td>
                                <td>{score.teamwork}</td>
                                <td>{total}({total / 15})</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <h2>Peer feedback</h2>
            {new Array(currentWeek).fill(0).map((_, i) =>
                <div key={i} className="relative left-6 top-6 p-2">
                    <h3><strong>Week {i + 1}</strong></h3>
                    <div className="relative top-2 left-6">
                        <h4>Strengths</h4>
                        <ul className="relative left-12">
                            {
                                strengthsByWeek.get(i)?.map((strength, j) => <li key={"W" + i + "S" + j}>{strength}</li>)
                            }
                        </ul>
                    </div>
                    <div className="relative top-2 left-6">
                        <h4>Areas of growth</h4>
                        <ul className="relative left-12">
                            {
                                areasOfGrowthByWeek.get(i)?.map((weakness, j) => <li key={"W" + i + "A" + j}>{weakness}</li>)
                            }
                        </ul>
                    </div>
                </div>
            )
            }
        </div >
    );
}