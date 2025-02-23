

interface Config {
    week0StartDate: Date;
}

import { PrismaClient } from "@prisma/client";
import config from "../../config.json";

export function getConfig(): Config {
    const week0StartDate = new Date(config.week0StartDate);
    return {
        week0StartDate
    };
}

export function currentWeek(): number {
    const now = new Date();
    const week0StartDate = getConfig().week0StartDate;
    const diff = now.getTime() - week0StartDate.getTime();
    const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    return week;
}

export type TeamScores = {
    week: number,
    forTeam: number,
    CICD: number | null,
    IssueTracking: number | null,
    VersionControl: number | null,
    Backlog: number | null
    UserStory: number | null
}

export type FeedbackLoaderData = {
    userID: number,
    currentWeek: number,
    scores: {
        week: number,
        independence: number | null,
        technical: number | null,
        teamwork: number | null,
        comments: string | null
    }[],
    peerFeedback: {
        // byUserID is only used to show the commenter names in the staff view, for student view the peer feedback is anonymous.
        byUserID: number,
        week: number,
        independenceContributions: string | null,
        independenceGrowth: string | null,
        technicalContributions: string | null,
        technicalGrowth: string | null,
        teamworkContributions: string | null,
        teamworkGrowth: string | null,
    }[],
    teamScores: TeamScores[]
};

export type FeedbackStaffLoaderData = FeedbackLoaderData & {
    peerFeedback: (FeedbackLoaderData["peerFeedback"][0] & { byUserName: string })[];
};

export type WeeklyReportLoaderData = {
    teamFeedback: {
        author: string,
        authorID: number,
        week: number,
        continueDoing: string | null,
        startDoing: string | null,
        stopDoing: string | null,
        contributions: string | null,
        challenges: string | null,
    }[],
}


export async function getUserFeedback(userID: number, team:number) : Promise<FeedbackLoaderData> {
    const prisma = new PrismaClient();

    const scores = await prisma.staffFeedback.findMany({
        where: {
            forUserID: userID
        },
        orderBy: {
            week: 'asc'
        },
        select: {
            week: true,
            independence: true,
            technical: true,
            teamwork: true,
            comments: true
        }
    })

    const week = currentWeek();
    const finalScores = [];
    let nextUnusedScoreIndex = 0;

    for (let i = 0; i <= week; i++) {
        if (nextUnusedScoreIndex < scores.length && 
            scores[nextUnusedScoreIndex].week == i) {
            finalScores.push(scores[nextUnusedScoreIndex]);
            nextUnusedScoreIndex++;
        }
        else {
            finalScores.push({
                week: i,
                independence: null,
                technical: null,
                teamwork: null,
                comments: ""
            })
        }
    }

    const teamScores = await prisma.staffTeamFeedback.findMany({
        where: {
            forTeam: team
        },
        orderBy: {
            week: 'asc'
        },
        select: {
            week: true,
            forTeam: true,
            CICD: true,
            IssueTracking: true,
            VersionControl: true,
            Backlog: true,
            UserStory: true
        }
    })

    const teamFinalScores = [];
    let nextUnusedTeamScoreIndex = 0;
    for (let i = 0; i <= week; i++) {
        if (nextUnusedTeamScoreIndex < teamScores.length && 
            teamScores[nextUnusedTeamScoreIndex].week == i) {
            teamFinalScores.push(teamScores[nextUnusedTeamScoreIndex]);
            nextUnusedTeamScoreIndex++;
        }
        else {
            teamFinalScores.push({
                week: i,
                forTeam: team,
                CICD: null,
                IssueTracking: null,
                VersionControl: null,
                Backlog: null,
                UserStory: null
            })
        }
    }

    const peerFeedback = await prisma.peerFeedback.findMany({
        where: {
            forUserID: userID
        },
        orderBy: {
            week: 'asc'
        },
    });

    return {
        userID: userID,
        currentWeek: currentWeek(),
        scores: finalScores,
        peerFeedback: peerFeedback,
        teamScores: teamFinalScores,
    };
}

export async function getWeeklyReport() : Promise<WeeklyReportLoaderData> {
    const prisma = new PrismaClient();

    const weeklyReports = await prisma.weeklyReport.findMany({
        orderBy: {
          week: "asc",
        },
      });
    
      const users = await prisma.user.findMany({
        select: { id: true, name: true }, 
      });
    
      const userMap: Record<number, string> = {};

      for (const user of users) {
        userMap[user.id] = user.name;
      }

      const reports = weeklyReports.map((report) => ({
        ...report,
        author: userMap[report.authorID], // Fallback for missing users
      }));
    
      return { teamFeedback: reports };
}

export async function getUserNameFromUserID(userID: number): Promise<string> {
    const prisma = new PrismaClient();
    const userName = await prisma.user.findUnique({
        select: { name: true},
        where: {
            id: userID
        } 
      });

    return userName ? userName.name : ""
}