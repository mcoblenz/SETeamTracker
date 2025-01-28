import { redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";

export async function action({ request }: { request: Request }) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  }