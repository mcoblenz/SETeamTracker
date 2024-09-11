import { redirect, LoaderFunctionArgs } from '@remix-run/node'
import { authenticator, User } from '../services/auth.server'
import { createUserSession } from '../services/session.server'
import { json } from 'stream/consumers';


export const loader = async ({ request }: LoaderFunctionArgs) => {
    console.log("loader in callback");
    const user: User = await authenticator.authenticate('google', request, {
        failureRedirect: '/',
        successRedirect: '/',
    });

    return user;
}