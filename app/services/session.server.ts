import { createCookieSessionStorage } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { User } from "./auth.server";


import { config } from 'dotenv';
config({ path: '.env.local' });

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SESSION_SECRET as string], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// const USER_SESSION_IS_ADMIN_KEY = "isAdmin";

// export async function createUserSession(user: User) {
//   const session = await getSession();
//   session.set(USER_SESSION_IS_ADMIN_KEY, user.isAdmin);
//   return redirect("/", {
//     headers: {
//       "Set-Cookie": await sessionStorage.commitSession(session, {
//         maxAge: 60 * 60 * 24 * 7 // 7 days,
//       }),
//     },
//   });
// }