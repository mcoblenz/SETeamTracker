import { PrismaClient } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { redirectIfNotAdmin } from '~/services/auth.server';


export const loader: LoaderFunction = async ({ request, params }) => {
    // Get data for all the user's team members.

    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        throw new Response("This functionality is only available to administrators.");
    }
    const id = params.id;
    if (id == undefined) {
        return redirect('/');
    }
    const idInt = parseInt(id);

    const prisma = new PrismaClient();

    const studentName = await prisma.user.findUnique(
        {
            select: {
                name: true
            },
            where: {
                id: idInt
            }
        }
    );

    return { id: idInt, name: studentName?.name };
}

export async function action({ request }: ActionFunctionArgs) {
    const prisma = new PrismaClient();
    try {
        await redirectIfNotAdmin(request);
    }
    catch (e) {
        return;
    }

    const id = (await request.formData()).get("id");
    if (id == undefined) {
        console.log("didn't find ID: ", id);
        return redirect('/');
    }
    const idInt = parseInt(id.toString());

    await prisma.user.update({
        where: {
            id: idInt
        },
        data: {
            droppedCourse: true
        }
    }
    );
    console.log("dropped student with ID ", idInt);
    return null;
}


export default function DropStudent() {
    const { id, name }: { id: number, name: string } = useLoaderData();
    return (<>
        Are you sure the student {name} has dropped?

        <Form method="post">
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Yes, remove this student.</button>
        </Form>
    </>);
}