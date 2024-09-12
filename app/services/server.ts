

interface Config {
    week0StartDate: Date;
}

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