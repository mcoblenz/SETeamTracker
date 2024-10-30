import { PrismaClient } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData, useParams } from "@remix-run/react";
import { FormEventHandler, useState } from "react";
import { PeerFeedback } from "~/components/feedback";
import { authenticator, redirectIfNotAdmin } from "~/services/auth.server";
import { FeedbackLoaderData, getUserFeedback } from "~/services/server";

export async function action({ request }: { request: Request }) {
    const prisma = new PrismaClient();

    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        return;
    }

    const user = await authenticator.isAuthenticated(request);
    if (!user) {
        return redirect("/");
    }
    const userRecord = await prisma.user.findUnique({ where: { email: user.email } });

    if (!userRecord || !userRecord.isAdmin) {
        return redirect("/");
    }

    const body = await request.formData();

    const keys = body.keys();
    for (const key of keys) {
        let matches = key.match("^I([0-9]+)W([0-9]+)$");

        if (matches && matches.length == 3) {
            const userID = matches[1];
            const week = matches[2];

            const rawScore = body.get(key) as string;
            const score = rawScore != null ? parseInt(rawScore) : null;
            await prisma.staffFeedback.upsert({
                where: {
                    forUserID_week: {
                        forUserID: parseInt(userID),
                        week: parseInt(week)
                    }
                },
                update: {
                    independence: score
                },
                create: {
                    forUserID: parseInt(userID),
                    week: parseInt(week),
                    independence: score
                }
            });

        }
        else {
            matches = key.match("^T([0-9]+)W([0-9]+)$");
            if (matches && matches.length == 3) {
                const userID = matches[1];
                const week = matches[2];

                const rawScore = body.get(key) as string;
                const score = rawScore != null ? parseInt(rawScore) : null;
                await prisma.staffFeedback.upsert({
                    where: {
                        forUserID_week: {
                            forUserID: parseInt(userID),
                            week: parseInt(week)
                        }
                    },
                    update: {
                        technical: score
                    },
                    create: {
                        forUserID: parseInt(userID),
                        week: parseInt(week),
                        technical: score
                    }
                })
            }

            else {
                matches = key.match("^W([0-9]+)W([0-9]+)$");
                if (matches && matches.length == 3) {
                    const userID = matches[1];
                    const week = matches[2];

                    const rawScore = body.get(key) as string;
                    const score = rawScore != null ? parseInt(rawScore) : null;
                    await prisma.staffFeedback.upsert({
                        where: {
                            forUserID_week: {
                                forUserID: parseInt(userID),
                                week: parseInt(week)
                            }
                        },
                        update: {
                            teamwork: score
                        },
                        create: {
                            forUserID: parseInt(userID),
                            week: parseInt(week),
                            teamwork: score
                        }
                    })

                }
                else {
                    matches = key.match("^currentWeekComments([0-9]+)W([0-9]+)$");
                    if (matches && matches.length == 3) {
                        const userID = parseInt(matches[1]);
                        const week = parseInt(matches[2]);

                        const comments = body.get(key);
                        await prisma.staffFeedback.upsert({
                            where: {
                                forUserID_week: {
                                    forUserID: userID,
                                    week: week
                                }
                            },
                            update: {
                                comments: comments?.toString()
                            },
                            create: {
                                forUserID: userID,
                                week: week,
                                comments: comments?.toString()
                            }
                        });
                    }
                }

            }
        }
    }

    // TODO

    return null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const prisma = new PrismaClient();

    const teamName = params.teamName;

    // Maps from name to feedback data
    let feedbackArray: Array<[string, FeedbackLoaderData]> = [];
    if (teamName) {
        const teamMembers = await prisma.user.findMany({
            distinct: ['email'],
            where: {
                team: teamName,
                droppedCourse: false,
            }
        });

        feedbackArray = await Promise.all(teamMembers.map(async member => {
            return [member.name, await getUserFeedback(member.id)];
        }));
    }

    return {
        feedback: feedbackArray
    };
};

export default function TeamMeeting() {
    const { feedback }: { feedback: Array<[string, FeedbackLoaderData]> } = useLoaderData();

    const [isError, setIsError] = useState(false);

    const reportErrorStatus = (_isError: boolean) => {
        console.log("Setting error status to: " + _isError);
        setIsError(_isError);

    }

    const handleSubmit: FormEventHandler = (e) => {
        if (isError) {
            console.log("preventing default");
            e.preventDefault();
        }
    }

    return (
        <div className="space-y-4">
            <h2>{useParams().teamName}</h2>
            <div className="space-y-5">
                <Form method="post" onSubmit={handleSubmit} className="space-y-5">
                    {
                        feedback.map((x, i) => (
                            <div key={i} className={i % 2 == 0 ? "bg-gray-100" : ""}>
                                <h3>{x[0]}<Link to={"/dropStudent/" + x[1].userID}> 🗑️ </Link></h3>
                                <PeerFeedback feedbackData={x[1]} isAdmin={true} reportErrorStatus={reportErrorStatus}
                                />
                            </div>
                        ))
                    }
                    <button type="submit" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Save</button>

                </Form>
            </div >
        </div >
    );
}