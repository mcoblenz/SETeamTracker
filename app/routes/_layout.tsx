import { Link, Outlet } from "@remix-run/react";

import { useOptionalUser } from "../utils";

import pkg from 'react-burger-menu';
const { slide } = pkg;
const Slide = slide; // TS wants the name capitalized!

// export default function Index() {
//     const user = useOptionalUser();

//     if (user?.isAdmin) {
//         return (
//             <>
//                 <h1>Welcome, Dr. {user.email}</h1>
//                 <Link to="/evil-deeds">Submit evil deeds</Link>
//             </>
//         );
//     }
//     else if (user && !user.isAdmin) {
//         return (<div>Not admin</div>);
//     }

//     return (
//         <>
//             <h1>Sorry, nothing to see here</h1>
//             <Link to="/login">Log In</Link>
//         </>
//     );
// }


export default function Layout() {
    const styles = {
        bmBurgerButton: {
            position: 'fixed',
            width: '36px',
            height: '30px',
            left: '36px',
            top: '36px'
        },
        bmBurgerBars: {
            background: '#373a47'
        },
        bmBurgerBarsHover: {
            background: '#a90000'
        },
        bmCrossButton: {
            height: '24px',
            width: '24px'
        },
        bmCross: {
            background: '#bdc3c7'
        },
        bmMenuWrap: {
            position: 'fixed',
            height: '100%'
        },
        bmMenu: {
            background: '#373a47',
            padding: '2.5em 1.5em 0',
            fontSize: '1.15em'
        },
        bmMorphShape: {
            fill: '#373a47'
        },
        bmItemList: {
            color: '#b8b7ad',
            padding: '0.8em'
        },
        // bmItem: {
        //     display: 'inline-block'
        // },
        bmOverlay: {
            background: 'rgba(0, 0, 0, 0.3)'
        }
    }

    const user = useOptionalUser();

    if (!user) {
        return (<div>< Link to="/login" > Log In</Link ></div>);
    }

    const isAdmin = user?.isAdmin;

    return (
        <div id="outer-container">
            <div id="sidebar">

                <Slide styles={styles} pageWrapId={"page-wrap"} outerContainerId={"outer-container"}>
                    {isAdmin ?
                        <>
                            < p > <Link to="/importRoster" className="menu-item" >Import team roster</Link></p>
                            < p > <Link to="/downloadScores" className="menu-item" >Download scores as CSV</Link></p>

                        </>
                        :
                        <>
                            < p > <Link to="/report" className="menu-item" >This week&rsquo;s report</Link></p>
                            < p > <Link to="/feedback" className="menu-item" >My feedback</Link></p>
                        </>
                    }
                </Slide>
            </div >

            <div id="page-wrap" className="relative ml-24">
                <Outlet />
            </div>
        </div>
    );
}