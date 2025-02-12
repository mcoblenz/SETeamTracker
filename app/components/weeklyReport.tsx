import { WeeklyReportLoaderData } from "~/services/server";


interface WeeklyReportProps {
    weeklyReportData: WeeklyReportLoaderData["teamFeedback"],
    isAdmin: boolean,
}

export function WeeklyReports(props: WeeklyReportProps) {
    const reports = props.weeklyReportData;
    const isAdmin = props.isAdmin;


    // Group reports by week
    const weeklyReportMap = new Map<number, {
        authorID: number,
        author: string,
        continueDoing: string | null,
        startDoing: string | null,
        stopDoing: string | null,
        contributions: string | null,
        challenges: string | null,
    }[]>();

    reports.forEach((report) => {
        let weeklyReport = weeklyReportMap.get(report.week);
        if (!weeklyReport) {
            weeklyReport = [];
        }
        weeklyReport.push(report)
        weeklyReportMap.set(report.week, weeklyReport);
    });
    
    console.log(reports);

  return (
    <div className="relative top-2">
      {Array.from(weeklyReportMap.entries()).map(([week, weeklyReport]) => (
        <div key={week} className="mb-8">
          <h2 className="text-xl font-bold mb-4">Week {week}</h2>
          <table className="table-auto border-collapse border border-gray-400 relative">
            <thead>
              <tr>
                {isAdmin && <th className="border border-gray-400 p-2">Team Member</th>}
                <th className="border border-gray-400 p-2">Start Doing</th>
                <th className="border border-gray-400 p-2">Stop Doing</th>
                <th className="border border-gray-400 p-2">Continue Doing</th>
                <th className="border border-gray-400 p-2">Contributions</th>
                <th className="border border-gray-400 p-2">Challenges</th>
              </tr>
            </thead>
            <tbody>
              {weeklyReport.map((report) => (
                <tr key={`${week}-${report.authorID}`}>
                  {isAdmin && <td className="border border-gray-400 px-2 py-1 w-48 break-words">{report.author}</td>}
                  <td className="border border-gray-400 px-2 py-1 w-64 break-words">{report.startDoing || "-"}</td>
                  <td className="border border-gray-400 px-2 py-1 w-64 break-words">{report.stopDoing || "-"}</td>
                  <td className="border border-gray-400 px-2 py-1 w-64 break-words">{report.continueDoing || "-"}</td>
                  <td className="border border-gray-400 px-2 py-1 w-64 break-words">{report.contributions || "-"}</td>
                  <td className="border border-gray-400 px-2 py-1 w-64 break-words">{report.challenges || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
