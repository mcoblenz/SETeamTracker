

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
        // Don't include byUserID here, since these are supposed to be anonymous.
        week: number,
        independenceContributions: string | null,
        independenceGrowth: string | null,
        technicalContributions: string | null,
        technicalGrowth: string | null,
        teamworkContributions: string | null,
        teamworkGrowth: string | null,
    }[]
};

export async function getUserFeedback(userID: number) : Promise<FeedbackLoaderData> {
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
        scores: scores,
        peerFeedback: peerFeedback
    };
}
