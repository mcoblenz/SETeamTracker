import { redirect, LoaderFunctionArgs } from '@remix-run/node'
import { authenticator, User } from '../services/auth.server'
import { createUserSession } from '../services/session.server'
import { json } from 'stream/consumers';

const DEBUG = false;

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
    const user: User = await authenticator.authenticate('google', request, {
        failureRedirect: '/',
        successRedirect: '/',
	throwOnError: DEBUG,
    });
    return user;
    }
    catch (error) {
        if (error instanceof Response) {
          // Re-throw or return the response if it's a redirect (common in OAuth flows)
          return error;
        }
        if (error instanceof AuthorizationError) {
          // Handle authentication-specific errors
          console.error("Authentication failed:", error.message);
          // You might return a JSON response with the error or set a session error
	  
        }
	throw error;
}
}