import { useState, useEffect } from "react";
import { FeedbackLoaderData, FeedbackStaffLoaderData } from "~/services/server";


interface PeerFeedbackProps {
    feedbackData: FeedbackLoaderData,
    isAdmin: boolean,
    reportErrorStatus: (isError: boolean) => void,
}

type CategorizedFeedBack = {
    byUserName: string
    independence: string;
    technical: string;
    teamwork: string;
};

export function PeerFeedback(props: PeerFeedbackProps) {
    const feedbackData = props.feedbackData;

    const isAdmin = props.isAdmin;
    
    const currentWeek = Math.max(feedbackData.currentWeek, 0);

    const peerFeedbackMap = new Map<number, {
        byUserName: string | null,
        independenceContributions: string | null,
        independenceGrowth: string | null,
        technicalContributions: string | null,
        technicalGrowth: string | null,
        teamworkContributions: string | null,
        teamworkGrowth: string | null,
    }[]>();

    // Aggregate peer feedback by week
    feedbackData.peerFeedback.forEach((feedback) => {
        let weekFeedback = peerFeedbackMap.get(feedback.week);
        if (!weekFeedback) {
            weekFeedback = [];
        }
        // Only access byUserName for staff
        let byUserName = null;
        if (isAdmin && "byUserName" in feedback) {
            byUserName = (feedback as FeedbackStaffLoaderData["peerFeedback"][0]).byUserName;
        }

        weekFeedback.push({
            byUserName,
            independenceContributions: feedback.independenceContributions,
            independenceGrowth: feedback.independenceGrowth,
            technicalContributions: feedback.technicalContributions,
            technicalGrowth: feedback.technicalGrowth,
            teamworkContributions: feedback.teamworkContributions,
            teamworkGrowth: feedback.teamworkGrowth,
        });

        peerFeedbackMap.set(feedback.week, weekFeedback);
    });

    const strengthsByWeek = new Map<number, CategorizedFeedBack[]>();
    const areasOfGrowthByWeek = new Map<number, CategorizedFeedBack[]>();

    const [errors, setErrors] = useState(new Map());
    const [scores, setScores] = useState(feedbackData.scores);
    useEffect(() => {
        // Update scores state when feedbackData changes
        setScores(feedbackData.scores);
    }, [feedbackData]);

    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>, week: number, field: string) => {
        const value = parseFloat(e.target.value);
        const updateScores = scores.map((score) => {
            return score.week === week ? {...score, [field]: value } : score;
        });
        if (value < 0 || value > 5) {
            setErrors(new Map(errors.set(e.target.name, "Scores must be between 0 and 5")));
            props.reportErrorStatus(true);
        }
        else {
            errors.delete(e.target.name);
            if (errors.size == 0) {
                props.reportErrorStatus(false);
            }
            setErrors(new Map(errors));
        }
        setScores(updateScores);
    };

    // Aggregate strengths and areas of growth by week
    peerFeedbackMap.forEach((feedback, week) => {
        // feedback is a list of feedback objects for a given week
        // We want to aggregate across the areas of strength and weakness.

        const strengths: CategorizedFeedBack[] = []
        const areasOfGrowth: CategorizedFeedBack[] = [];

        feedback.forEach((f) => {
            if (f.independenceContributions || f.technicalContributions || f.teamworkContributions) {
                const strengthContribution: CategorizedFeedBack = {
                    byUserName: f.byUserName || "",
                    independence: f.independenceContributions || "",
                    technical: f.technicalContributions || "",
                    teamwork: f.teamworkContributions || "",
                };
                strengths.push(strengthContribution);
            }
            if (f.independenceGrowth || f.technicalGrowth || f.teamworkGrowth) {
                const growthContribution: CategorizedFeedBack = {
                    byUserName: f.byUserName || "",
                    independence: f.independenceGrowth || "",
                    technical: f.technicalGrowth || "",
                    teamwork: f.teamworkGrowth || "",
                };
                areasOfGrowth.push(growthContribution);
            }
        });
        
        strengthsByWeek.set(week, strengths);
        areasOfGrowthByWeek.set(week, areasOfGrowth);
    });

    //find the first week for which data is not empty (before the current week) else return current week onwards
    const getFirstKeyAsInt = (map: Map<number, CategorizedFeedBack[]>) => {
        const firstEntry = map.entries().next().value;
        return firstEntry ? parseInt(firstEntry[0], 10) : currentWeek;
    };
    
    const ind1 = getFirstKeyAsInt(strengthsByWeek);
    const ind2 = getFirstKeyAsInt(areasOfGrowthByWeek);
    const firstWeek = Math.min(ind1, ind2);
    const validationError = <div className="text-red-600">Values must be between 0 and 5.</div>;

    let currentComments = scores.find((score) => score.week == currentWeek)?.comments ? scores.find((score) => score.week == currentWeek)?.comments : "";
    if (currentComments == null) {
        currentComments = "";
    }

    return (
        <div>
            <div className="p-4">
                <h4>Staff Scores</h4>
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
                            const total = score.independence && score.technical && score.teamwork ? score.independence + score.technical + score.teamwork : 0;
                            return (
                                <tr key={score.week}>
                                    <td>{score.week}</td>
                                    <td>{isAdmin ?
                                        <input name={"I" + feedbackData.userID + "W" + score.week}
                                            type="number"
                                            value={score.independence != null ? score.independence : ""}
                                            onChange={(e) => handleScoreChange(e, score.week, "independence")} />
                                        : score.independence}
                                        {errors.get("I" + feedbackData.userID + "W" + score.week) ? validationError : <></>}
                                    </td>
                                    <td>
                                        {isAdmin ?
                                            <input name={"T" + feedbackData.userID + "W" + score.week}
                                                type="number"
                                                value={score.technical != null ? score.technical : ""}
                                                onChange={(e) => handleScoreChange(e, score.week, "technical")} />
                                            : score.technical}
                                        {errors.get("T" + feedbackData.userID + "W" + score.week) ? validationError : <></>}

                                    </td>
                                    <td>
                                        {isAdmin ?
                                            <input name={"W" + feedbackData.userID + "W" + score.week}
                                                type="number"
                                                value={score.teamwork != null ? score.teamwork : ""}
                                                onChange={(e) => handleScoreChange(e, score.week, "teamwork")} />
                                            : score.teamwork}
                                        {errors.get("W" + feedbackData.userID + "W" + score.week) ? validationError : <></>}
                                    </td>
                                    <td>{total} ({((total / 15) * 100).toFixed()}%)</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <strong>TA comments, week {currentWeek}:</strong>
                <p /><textarea name={"currentWeekComments" + feedbackData.userID + "W" + currentWeek} className="h-32 w-full" defaultValue={currentComments} />

                {new Array(currentWeek + 1).fill(0).map((_, i) => i>=firstWeek &&
                    <div key={i} className="relative top-6 p-2">
                        <strong>Week {i}</strong>
                        <div className="relative top-2 left-6">
                            <strong>Strengths</strong>
                            {strengthsByWeek.get(i) && (
                            <table className="table-auto border-collapse border border-gray-400 relative left-6">
                                <thead>
                                    <tr>
                                        {isAdmin && (<th className="border border-gray-400 p-2">Team Member</th>)}
                                        <th className="border border-gray-400 p-2">Independence</th>
                                        <th className="border border-gray-400 p-2">Technical</th>
                                        <th className="border border-gray-400 p-2">Teamwork</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {strengthsByWeek.get(i)?.map((strength, j) => (
                                        <tr key={"W" + i + "S" + j}>
                                            {isAdmin && (<td className="border border-gray-400 px-2 py-1 w-48 break-words">{strength.byUserName}</td>)}
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{strength.independence}</td>
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{strength.technical}</td>
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{strength.teamwork}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}
                        </div>
                        <div className="relative top-2 left-6">
                            <strong>Areas of growth</strong>
                            {areasOfGrowthByWeek.get(i) && (
                            <table className="table-auto border-collapse border border-gray-400 relative  left-6">
                                <thead>
                                    <tr>
                                        {isAdmin && (<th className="border border-gray-400 p-2">Team Member</th>)}
                                        <th className="border border-gray-400 p-2">Independence</th>
                                        <th className="border border-gray-400 p-2">Technical</th>
                                        <th className="border border-gray-400 p-2">Teamwork</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areasOfGrowthByWeek.get(i)?.map((weakness, j) => (
                                        <tr key={"W" + i + "A" + j}>
                                            {isAdmin && (<td className="border border-gray-400 px-2 py-1 w-48 break-words">{weakness.byUserName}</td>)}
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{weakness.independence}</td>
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{weakness.technical}</td>
                                            <td className="border border-gray-400 px-2 py-1 w-80 break-words">{weakness.teamwork}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}
                        </div>
                        <div className="relative top-2 left-6">
                            <strong> TA comments</strong>
                            <p className="relative left-6">{scores.find((score) => score.week == i)?.comments}</p>
                        </div>
                    </div>
                )
                }
            </div>
        </div >
    );
}