import { FeedbackLoaderData } from "~/services/server";

export function PeerFeedback(feedbackData: FeedbackLoaderData) {
    const scores = feedbackData.scores;
    const currentWeek = Math.max(feedbackData.currentWeek, 1);

    const peerFeedbackMap = new Map<number, {
        independenceContributions: string | null,
        independenceGrowth: string | null,
        technicalContributions: string | null,
        technicalGrowth: string | null,
        teamworkContributions: string | null,
        teamworkGrowth: string | null
    }[]>();

    // Aggregate peer feedback by week
    feedbackData.peerFeedback.forEach((feedback) => {
        let weekFeedback = peerFeedbackMap.get(feedback.week);
        if (!weekFeedback) {
            weekFeedback = [];
        }
        weekFeedback.push(feedback)
        peerFeedbackMap.set(feedback.week, weekFeedback);
    });

    const strengthsByWeek = new Map<number, string[]>();
    const areasOfGrowthByWeek = new Map<number, string[]>();

    console.log("peer feedback map: ", peerFeedbackMap);

    // Aggregate strengths and areas of growth by week
    peerFeedbackMap.forEach((feedback, week) => {
        // feedback is a list of feedback objects for a given week
        // We want to aggregate across the areas of strength and weakness.

        const strengths: string[] = [];
        const areasOfGrowth: string[] = [];
        feedback.forEach((f) => {
            if (f.independenceContributions) strengths.push(f.independenceContributions);
            if (f.technicalContributions) strengths.push(f.technicalContributions);
            if (f.teamworkContributions) strengths.push(f.teamworkContributions);
            if (f.independenceGrowth) areasOfGrowth.push(f.independenceGrowth);
            if (f.technicalGrowth) areasOfGrowth.push(f.technicalGrowth);
            if (f.teamworkGrowth) areasOfGrowth.push(f.teamworkGrowth);
        });

        strengthsByWeek.set(week, strengths);
        areasOfGrowthByWeek.set(week, areasOfGrowth);
    });

    return (
        <div>
            <div className="p-4">
                <h2>Staff Scores</h2>
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
                                    <td>{score.independence}</td>
                                    <td>{score.technical}</td>
                                    <td>{score.teamwork}</td>
                                    <td>{total} ({((total / 15) * 100).toFixed()}%)</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>


                {new Array(currentWeek).fill(0).map((_, i) =>
                    <div key={i} className="relative top-6 p-2">
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
                        <div className="relative top-2 left-6">
                            <h4> TA comments</h4>
                            <p className="relative left-6">{scores.find((score) => score.week == i)?.comments}</p>
                        </div>
                    </div>
                )
                }
            </div>
        </div >
    );
}