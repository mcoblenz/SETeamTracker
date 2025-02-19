import { PrismaClient } from "@prisma/client";
import { redirect, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { getSession } from "~/services/session.server";
import {
  FeedbackLoaderData,
  WeeklyReportLoaderData,
  getUserFeedback,
  getWeeklyReport,
} from "~/services/server";
import { PeerFeedback } from "~/components/feedback";
import { redirectIfNotLoggedIn } from "~/services/auth.server";
import { WeeklyReports } from "~/components/weeklyReport";
import { TeamFeedback } from "~/components/teamFeedback";

export const loader: LoaderFunction = async ({ request }) => {
  // Get data for all the user's team members.

  try {
    await redirectIfNotLoggedIn(request);
  } catch (e) {
    throw new Response(
      "This functionality is only available to administrators."
    );
  }

  const session = await getSession(request.headers.get("Cookie"));

  const user = session.get("user");
  if (user == undefined) {
    return redirect("/");
  }

  const prisma = new PrismaClient();

  const userRecord = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (userRecord == null) {
    console.log("UserID not found for email: " + user.email);
    return redirect("/noAccess");
  }

  const feedback = await getUserFeedback(userRecord.id, userRecord.team);

  const teamName = userRecord.team;
  const teamMembers = await prisma.user.findMany({
    distinct: ["email"],
    where: {
      team: teamName,
      droppedCourse: false,
    },
  });

  const weeklyReports = await getWeeklyReport(); // Assume this function fetches all weekly reports
  const teamMemberNames = new Set(teamMembers.map((member) => member.name));
  const weeklyReportsArray = weeklyReports.teamFeedback.filter((report) =>
    teamMemberNames.has(report.author)
  );

  return {
    feedback: feedback,
    weeklyReport: weeklyReportsArray,
  };
};

export default function Feedback() {
  const {
    feedback,
    weeklyReport,
  }: {
    feedback: FeedbackLoaderData;
    weeklyReport: WeeklyReportLoaderData["teamFeedback"];
  } = useLoaderData();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reportErrorStatus = (_isError: boolean) => {
    // nothing to do here
  };

  return (
    <>
      <h1>My feedback</h1>
      <TeamFeedback
        teamScores={feedback.teamScores}
        isAdmin={false}
        reportErrorStatus={reportErrorStatus}
      />
      <PeerFeedback
        feedbackData={feedback}
        isAdmin={false}
        reportErrorStatus={reportErrorStatus}
      />
      <h3 className="py-4">Weekly Team Retrospective</h3>
      <hr />
      <WeeklyReports weeklyReportData={weeklyReport} isAdmin={false} />
    </>
  );
}
