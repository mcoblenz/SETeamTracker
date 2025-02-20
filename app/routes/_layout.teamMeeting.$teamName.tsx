// import { PrismaClient } from "@prisma/client";
// import { LoaderFunction } from "@remix-run/node";
// import {
//     Form,
//     Link,
//     redirect,
//     useLoaderData,
//     useParams,
// } from "@remix-run/react";
// import { FormEventHandler, useState } from "react";
// import { PeerFeedback } from "~/components/feedback";
// // import { TeamFeedback } from "~/components/teamFeedback";
// import { WeeklyReports } from "~/components/weeklyReport";
// import { authenticator, redirectIfNotAdmin } from "~/services/auth.server";
// import {
//     FeedbackLoaderData,
//     WeeklyReportLoaderData,
//     getUserFeedback,
//     getWeeklyReport,
//     getUserNameFromUserID,
//     TeamScores,
// } from "~/services/server";

// export async function action({ request }: { request: Request }) {
//     const prisma = new PrismaClient();

//     try {
//         await redirectIfNotAdmin(request);
//     } catch (e) {
//         return;
//     }

//     const user = await authenticator.isAuthenticated(request);
//     if (!user) {
//         return redirect("/");
//     }
//     const userRecord = await prisma.user.findUnique({
//         where: { email: user.email },
//     });

//     if (!userRecord || !userRecord.isAdmin) {
//         return redirect("/");
//     }

//     const body = await request.formData();
//     console.log("body: ", body);

//     const keys = body.keys();
//     console.log("keys: ", keys);
//     for (const key of keys) {
//         let matches = key.match("^I([0-9]+)W([0-9]+)$");

//         if (matches && matches.length == 3) {
//             const userID = matches[1];
//             const week = matches[2];

//             const rawScore = body.get(key) as string;
//             const score = rawScore != null ? parseFloat(rawScore) : null;
//             await prisma.staffFeedback.upsert({
//                 where: {
//                     forUserID_week: {
//                         forUserID: parseInt(userID),
//                         week: parseInt(week),
//                     },
//                 },
//                 update: {
//                     independence: score,
//                 },
//                 create: {
//                     forUserID: parseInt(userID),
//                     week: parseInt(week),
//                     independence: score,
//                 },
//             });
//         } else {
//             matches = key.match("^T([0-9]+)W([0-9]+)$");
//             if (matches && matches.length == 3) {
//                 const userID = matches[1];
//                 const week = matches[2];

//                 const rawScore = body.get(key) as string;
//                 const score = rawScore != null ? parseFloat(rawScore) : null;
//                 await prisma.staffFeedback.upsert({
//                     where: {
//                         forUserID_week: {
//                             forUserID: parseInt(userID),
//                             week: parseInt(week),
//                         },
//                     },
//                     update: {
//                         technical: score,
//                     },
//                     create: {
//                         forUserID: parseInt(userID),
//                         week: parseInt(week),
//                         technical: score,
//                     },
//                 });
//             } else {
//                 matches = key.match("^W([0-9]+)W([0-9]+)$");
//                 if (matches && matches.length == 3) {
//                     const userID = matches[1];
//                     const week = matches[2];

//                     const rawScore = body.get(key) as string;
//                     const score = rawScore != null ? parseFloat(rawScore) : null;
//                     await prisma.staffFeedback.upsert({
//                         where: {
//                             forUserID_week: {
//                                 forUserID: parseInt(userID),
//                                 week: parseInt(week),
//                             },
//                         },
//                         update: {
//                             teamwork: score,
//                         },
//                         create: {
//                             forUserID: parseInt(userID),
//                             week: parseInt(week),
//                             teamwork: score,
//                         },
//                     });
//                 } else {
//                     matches = key.match("^currentWeekComments([0-9]+)W([0-9]+)$");
//                     if (matches && matches.length == 3) {
//                         const userID = parseInt(matches[1]);
//                         const week = parseInt(matches[2]);

//                         const comments = body.get(key);
//                         await prisma.staffFeedback.upsert({
//                             where: {
//                                 forUserID_week: {
//                                     forUserID: userID,
//                                     week: week,
//                                 },
//                             },
//                             update: {
//                                 comments: comments?.toString(),
//                             },
//                             create: {
//                                 forUserID: userID,
//                                 week: week,
//                                 comments: comments?.toString(),
//                             },
//                         });
//                     }
//                     // } else {
//                     //     matches = key.match("^C([0-9]+)W([0-9]+)$");
//                     //     if (matches && matches.length == 3) {
//                     //         const team = matches[1];
//                     //         const week = matches[2];

//                     //         const rawScore = body.get(key) as string;
//                     //         const score = rawScore != null ? parseFloat(rawScore) : null;
//                     //         await prisma.staffTeamFeedback.upsert({
//                     //             where: {
//                     //                 week_team: {
//                     //                     forTeam: parseInt(team),
//                     //                     week: parseInt(week),
//                     //                 },
//                     //                 week: parseInt(week),
//                     //             },
//                     //             update: {
//                     //                 CICD: score,
//                     //             },
//                     //             create: {
//                     //                 forTeam: parseInt(team),
//                     //                 week: parseInt(week),
//                     //                 CICD: score,
//                     //             },
//                     //         });
//                     //     }
//                     //     else {
//                     //         matches = key.match("^K([0-9]+)W([0-9]+)$");
//                     //         console.log("matches in k: ", matches);
//                     //         if (matches && matches.length == 3) {
//                     //             const team = matches[1];
//                     //             const week = matches[2];

//                     //             const rawScore = body.get(key) as string;
//                     //             const score = rawScore != null ? parseFloat(rawScore) : null;
//                     //             await prisma.staffTeamFeedback.upsert({
//                     //                 where: {
//                     //                     week_team: {
//                     //                         forTeam: parseInt(team),
//                     //                         week: parseInt(week),
//                     //                     },
//                     //                     week: parseInt(week),
//                     //                 },
//                     //                 update: {
//                     //                     IssueTracking: score,
//                     //                 },
//                     //                 create: {
//                     //                     forTeam: parseInt(team),
//                     //                     week: parseInt(week),
//                     //                     IssueTracking: score,
//                     //                 },
//                     //             });
//                     //         }
//                     //         else {
//                     //             matches = key.match("^V([0-9]+)W([0-9]+)$");
//                     //             if (matches && matches.length == 3) {
//                     //                 const team = matches[1];
//                     //                 const week = matches[2];

//                     //                 const rawScore = body.get(key) as string;
//                     //                 const score = rawScore != null ? parseFloat(rawScore) : null;
//                     //                 await prisma.staffTeamFeedback.upsert({
//                     //                     where: {
//                     //                         week_team: {
//                     //                             forTeam: parseInt(team),
//                     //                             week: parseInt(week),
//                     //                         },
//                     //                         week: parseInt(week),
//                     //                     },
//                     //                     update: {
//                     //                         VersionControl: score,
//                     //                     },
//                     //                     create: {
//                     //                         forTeam: parseInt(team),
//                     //                         week: parseInt(week),
//                     //                         VersionControl: score,
//                     //                     },
//                     //                 });
//                     //             } else {
//                     //                 matches = key.match("^B([0-9]+)W([0-9]+)$");
//                     //                 if (matches && matches.length == 3) {
//                     //                     const team = matches[1];
//                     //                     const week = matches[2];

//                     //                     const rawScore = body.get(key) as string;
//                     //                     const score = rawScore != null ? parseFloat(rawScore) : null;
//                     //                     await prisma.staffTeamFeedback.upsert({
//                     //                         where: {
//                     //                             week_team: {
//                     //                                 forTeam: parseInt(team),
//                     //                                 week: parseInt(week),
//                     //                             },
//                     //                             week: parseInt(week),
//                     //                         },
//                     //                         update: {
//                     //                             Backlog: score,
//                     //                         },
//                     //                         create: {
//                     //                             forTeam: parseInt(team),
//                     //                             week: parseInt(week),
//                     //                             Backlog: score,
//                     //                         },
//                     //                     });
//                     //                 }

//                     //             }
//                     //         }
//                     //     }
//                     // }
//                 }
//             }
//         }

//         // TODO

//         return null;
//     }
// }

// export const loader: LoaderFunction = async ({ request, params }) => {
//     const prisma = new PrismaClient();

//     const teamName = params.teamName;

//     // Team ID must be an Int
//     const teamID = teamName ? parseInt(teamName, 10) : -1;
//     console.log("Team ID: " + teamID);
//     if (teamID == -1 || isNaN(teamID)) {
//         throw new Response("Invalid team ID ", { status: 400 });
//     }

//     // Maps from name to feedback data
//     let feedbackArray: Array<[string, FeedbackLoaderData]> = [];
//     let weeklyReportsArray: WeeklyReportLoaderData["teamFeedback"] = [];
//     let teamScores: TeamScores[] = []

//     if (teamName) {
//         const teamMembers = await prisma.user.findMany({
//             distinct: ["email"],
//             where: {
//                 team: teamID,
//                 droppedCourse: false,
//             },
//         });

//         feedbackArray = await Promise.all(
//             teamMembers.map(async (member) => {
//                 const feedback = await getUserFeedback(member.id, member.team);
//                 teamScores = feedback.teamScores;
//                 const peerFeedbackWithNames = await Promise.all(
//                     feedback.peerFeedback.map(async (peer) => {
//                         const byUserName = await getUserNameFromUserID(peer.byUserID);
//                         return { ...peer, byUserName };
//                     })
//                 );
//                 return [
//                     member.name,
//                     { ...feedback, peerFeedback: peerFeedbackWithNames },
//                 ];
//             })
//         );

//         const weeklyReports = await getWeeklyReport();
//         const teamMemberNames = new Set(teamMembers.map((member) => member.name));
//         weeklyReportsArray = weeklyReports.teamFeedback.filter((report) =>
//             teamMemberNames.has(report.author)
//         );
//     }

//     return {
//         feedback: feedbackArray,
//         teamScores: teamScores,
//         weeklyReport: weeklyReportsArray,
//     };
// };

// export default function TeamMeeting() {
//     const { feedback, weeklyReport, teamScores }:
//         {
//             feedback: Array<[string, FeedbackLoaderData]>,
//             weeklyReport: WeeklyReportLoaderData["teamFeedback"],
//             teamScores: TeamScores[]
//         } = useLoaderData();
//     const [isError, setIsError] = useState(false);

//     const reportErrorStatus = (_isError: boolean) => {
//         console.log("Setting error status to: " + _isError);
//         setIsError(_isError);
//     };

//     const [showFormSubmitted, setShowFormSubmitted] = useState(false);
//     const handleSubmit: FormEventHandler = (e) => {
//         if (isError) {
//             console.log("preventing default");
//             e.preventDefault();
//         } else {
//             setShowFormSubmitted(true);
//             setTimeout(() => {
//                 setShowFormSubmitted(false);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <h2>{useParams().teamName}</h2>
//             <div className="space-y-5">
//                 <h3>Weekly Team Reports</h3>
//                 <WeeklyReports weeklyReportData={weeklyReport} isAdmin={true} />
//                 <Form method="post" onSubmit={handleSubmit} className="space-y-5">
//                     {/* <TeamFeedback
//                         teamScores={teamScores}
//                         isAdmin={true}
//                         reportErrorStatus={reportErrorStatus}
//                     /> */}
//                     {feedback.map((x, i) => (
//                         <div key={i} className={i % 2 == 0 ? "bg-gray-100" : ""}>
//                             <h3>
//                                 {x[0]}
//                                 <Link to={"/dropStudent/" + x[1].userID}> 🗑️ </Link>
//                             </h3>
//                             <PeerFeedback
//                                 feedbackData={x[1]}
//                                 isAdmin={true}
//                                 reportErrorStatus={reportErrorStatus}
//                             />
//                         </div>
//                     ))}
//                     <button
//                         type="submit"
//                         className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                     >
//                         {showFormSubmitted ? "Saved" : "Save"}
//                     </button>
//                 </Form>
//             </div>
//         </div>
//     );
// }


import { PrismaClient } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData, useParams } from "@remix-run/react";
import { FormEventHandler, useState } from "react";
import { PeerFeedback } from "~/components/feedback";
import { TeamFeedback } from "~/components/teamFeedback";
import { WeeklyReports } from "~/components/weeklyReport";
import { authenticator, redirectIfNotAdmin } from "~/services/auth.server";
import { FeedbackLoaderData, FeedbackStaffLoaderData, WeeklyReportLoaderData, getUserFeedback, getWeeklyReport, getUserNameFromUserID, TeamScores } from "~/services/server";

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
            const score = rawScore != null ? parseFloat(rawScore) : null;
            await prisma.staffFeedback.upsert({
                where: {
                    forUserID_week: {
                        forUserID: parseInt(userID),
                        week: parseInt(week),
                    },
                },
                update: {
                    independence: score,
                },
                create: {
                    forUserID: parseInt(userID),
                    week: parseInt(week),
                    independence: score,
                },
            });
        } else {
            matches = key.match("^T([0-9]+)W([0-9]+)$");
            if (matches && matches.length == 3) {
                const userID = matches[1];
                const week = matches[2];

                const rawScore = body.get(key) as string;
                const score = rawScore != null ? parseFloat(rawScore) : null;
                await prisma.staffFeedback.upsert({
                    where: {
                        forUserID_week: {
                            forUserID: parseInt(userID),
                            week: parseInt(week),
                        },
                    },
                    update: {
                        technical: score,
                    },
                    create: {
                        forUserID: parseInt(userID),
                        week: parseInt(week),
                        technical: score,
                    },
                });
            } else {
                matches = key.match("^W([0-9]+)W([0-9]+)$");
                if (matches && matches.length == 3) {
                    const userID = matches[1];
                    const week = matches[2];

                    const rawScore = body.get(key) as string;
                    const score = rawScore != null ? parseFloat(rawScore) : null;
                    await prisma.staffFeedback.upsert({
                        where: {
                            forUserID_week: {
                                forUserID: parseInt(userID),
                                week: parseInt(week),
                            },
                        },
                        update: {
                            teamwork: score,
                        },
                        create: {
                            forUserID: parseInt(userID),
                            week: parseInt(week),
                            teamwork: score,
                        },
                    });
                } else {
                    matches = key.match("^currentWeekComments([0-9]+)W([0-9]+)$");
                    if (matches && matches.length == 3) {
                        const userID = parseInt(matches[1]);
                        const week = parseInt(matches[2]);

                        const comments = body.get(key);
                        await prisma.staffFeedback.upsert({
                            where: {
                                forUserID_week: {
                                    forUserID: userID,
                                    week: week,
                                },
                            },
                            update: {
                                comments: comments?.toString(),
                            },
                            create: {
                                forUserID: userID,
                                week: week,
                                comments: comments?.toString(),
                            },
                        });
                    } else {
                        matches = key.match("^C([0-9]+)W([0-9]+)$");
                        if (matches && matches.length == 3) {
                            const team = matches[1];
                            const week = matches[2];

                            const rawScore = body.get(key) as string;
                            const score = rawScore != null ? parseFloat(rawScore) : null;
                            await prisma.staffTeamFeedback.upsert({
                                where: {
                                    week_team: {
                                        forTeam: parseInt(team),
                                        week: parseInt(week),
                                    },
                                },
                                update: {
                                    CICD: score,
                                },
                                create: {
                                    forTeam: parseInt(team),
                                    week: parseInt(week),
                                    CICD: score,
                                }
                            });
                        } else {
                            matches = key.match("^K([0-9]+)W([0-9]+)$");
                            if (matches && matches.length == 3) {
                                const team = matches[1];
                                const week = matches[2];

                                const rawScore = body.get(key) as string;
                                const score = rawScore != null ? parseFloat(rawScore) : null;
                                await prisma.staffTeamFeedback.upsert({
                                    where: {
                                        week_team: {
                                            forTeam: parseInt(team),
                                            week: parseInt(week),
                                        },
                                    },
                                    update: {
                                        IssueTracking: score,
                                    },
                                    create: {
                                        forTeam: parseInt(team),
                                        week: parseInt(week),
                                        IssueTracking: score,
                                    }
                                });
                            } else {
                                matches = key.match("^V([0-9]+)W([0-9]+)$");
                                if (matches && matches.length == 3) {
                                    const team = matches[1];
                                    const week = matches[2];

                                    const rawScore = body.get(key) as string;
                                    const score = rawScore != null ? parseFloat(rawScore) : null;
                                    await prisma.staffTeamFeedback.upsert({
                                        where: {
                                            week_team: {
                                                forTeam: parseInt(team),
                                                week: parseInt(week),
                                            },
                                        },
                                        update: {
                                            VersionControl: score,
                                        },
                                        create: {
                                            forTeam: parseInt(team),
                                            week: parseInt(week),
                                            VersionControl: score,
                                        }
                                    });
                                } else {
                                    matches = key.match("^B([0-9]+)W([0-9]+)$");
                                    if (matches && matches.length == 3) {
                                        const team = matches[1];
                                        const week = matches[2];

                                        const rawScore = body.get(key) as string;
                                        const score = rawScore != null ? parseFloat(rawScore) : null;
                                        await prisma.staffTeamFeedback.upsert({
                                            where: {
                                                week_team: {
                                                    forTeam: parseInt(team),
                                                    week: parseInt(week),
                                                },
                                            },
                                            update: {
                                                Backlog: score,
                                            },
                                            create: {
                                                forTeam: parseInt(team),
                                                week: parseInt(week),
                                                Backlog: score,
                                            }
                                        });
                                    }
                                }
                            }
                        }
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

    // Team ID must be an Int
    const teamID = teamName ? parseInt(teamName, 10) : -1;
    if (teamID == -1 || isNaN(teamID)) {
        throw new Response("Invalid team ID ", { status: 400 });
    }

    // Maps from name to feedback data
    let feedbackArray: Array<[string, FeedbackLoaderData]> = [];
    let weeklyReportsArray: WeeklyReportLoaderData["teamFeedback"] = [];
    let teamScoresArray: TeamScores[] = [];
    if (teamName) {
        const teamMembers = await prisma.user.findMany({
            distinct: ["email"],
            where: {
                team: teamID,
                droppedCourse: false,
            }
        });

        feedbackArray = await Promise.all(teamMembers.map(async member => {
            console.log("member team: ", member.team);
            const feedback = await getUserFeedback(member.id, member.team);
            teamScoresArray = feedback.teamScores;
            const peerFeedbackWithNames = await Promise.all(feedback.peerFeedback.map(async peer => {
                const byUserName = await getUserNameFromUserID(peer.byUserID);
                return { ...peer, byUserName };
            }));
            return [member.name, { ...feedback, peerFeedback: peerFeedbackWithNames }];
        }));

        const weeklyReports = await getWeeklyReport();
        const teamMemberNames = new Set(teamMembers.map((member) => member.name));
        weeklyReportsArray = weeklyReports.teamFeedback.filter((report) => teamMemberNames.has(report.author));
    }

    return {
        feedback: feedbackArray,
        weeklyReport: weeklyReportsArray,
        teamScores: teamScoresArray
    };
};

export default function TeamMeeting() {
    const { feedback, weeklyReport, teamScores }: {
        feedback: Array<[string, FeedbackLoaderData]>,
        weeklyReport: WeeklyReportLoaderData["teamFeedback"]
        teamScores: TeamScores[]
    } = useLoaderData();
    const [isError, setIsError] = useState(false);
    const reportErrorStatus = (_isError: boolean) => {
        console.log("Setting error status to: " + _isError);
        setIsError(_isError);

    }


    const [showFormSubmitted, setShowFormSubmitted] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        if (isError) {
            console.log("preventing default");
            e.preventDefault();
        }
        else {
            setShowFormSubmitted(true);
            setTimeout(() => {
                setShowFormSubmitted(false);
            }, 1000);
        }
    }

    return (
        <div className="space-y-4">
            <h2>{useParams().teamName}</h2>
            <div className="space-y-5">
                <h3>Weekly Team Reports</h3>
                <WeeklyReports weeklyReportData={weeklyReport} isAdmin={true} />
                <Form method="post" onSubmit={handleSubmit} className="space-y-5">
                    <TeamFeedback teamScores={teamScores} isAdmin={true} reportErrorStatus={reportErrorStatus} />
                    {
                        feedback.map((x, i) => (
                            <div key={i} className={i % 2 == 0 ? "bg-gray-100" : ""}>
                                <h3>{x[0]}<Link to={"/dropStudent/" + x[1].userID}> 🗑️ </Link></h3>
                                <PeerFeedback feedbackData={x[1]} isAdmin={true} reportErrorStatus={reportErrorStatus}
                                />
                            </div>
                        ))
                    }
                    <button type="submit" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{showFormSubmitted ? "Saved" : "Save"}</button>
                </Form>
            </div >
        </div >
    );
}