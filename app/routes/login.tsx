import { Form } from "@remix-run/react";

export const loginStyles = {
    padding: '0.5em',
    border: '1px solid black',
    borderRadius: '10px', 
    fontSize: 'large'
}
export default function Login() {
    return (
        <div>
            <Form action="/auth/google" method="post" style={{margin: '2em', justifySelf: 'center'}}>
                <button style={loginStyles}>Login with Google</button>
            </Form>
        </div>
    )
}