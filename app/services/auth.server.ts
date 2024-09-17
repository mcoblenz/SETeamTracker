import { GoogleStrategy } from 'remix-auth-google';
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { install } from 'source-map-support';
import { PrismaClient } from '@prisma/client'
import { redirect } from '@remix-run/react';

install({
      environment: 'node'
     });

export interface User {
    email: string;
    isAdmin: boolean;
}

// Create an instance of the authenticator
// It will take session storage as an input parameter and creates the user session on successful authentication
export const authenticator = new Authenticator<User>(sessionStorage);

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('${process.env.GOOGLE_CLIENT_ID} is required');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('${process.env.GOOGLE_CLIENT_SECRET} is required');
}

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5173/auth/google/callback',
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    // return User.findOrCreate({ email: profile.emails[0].value })
    // TODO: look up the user and get their access level?

    const email = profile.emails[0].value;

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    
    console.log("Looked up user: " + user);
    if (user != null) {
        return {email: email, isAdmin: user?.isAdmin};
    }
    else {
        return {email: email, isAdmin: false};
    }
  }
)

authenticator.use(googleStrategy)

export async function redirectIfNotAdmin(request: Request) {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
        return redirect("/noAccess");
    }

    const prisma = new PrismaClient();
    const userRecord = await prisma.user.findUnique({ where: { email: user.email } });
    if (!userRecord || !userRecord.isAdmin) {
        return redirect("/noAccess");
    }
}