import type { MetaFunction } from "@remix-run/node";

import pkg from 'react-burger-menu';
const { slide } = pkg;
const Slide = slide; // TS wants the name capitalized!

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export default function Index() {
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

    return (
        <div id="top">

            <Slide styles={styles} >
                <p><a id="home" className="menu-item" href="/">Home</a></p>
                <p><a id="about" className="menu-item" href="/about">About</a></p>
                <p><a id="contact" className="menu-item" href="/contact">Contact</a></p>
                {/* <a onClick={this.showSettings} className="menu-item--small" href="">Settings</a> */}
            </Slide>


            < div className="font-sans p-4" >
                <h1 className="text-3xl">Welcome to Remix.</h1>
                <ul className="list-disc mt-4 pl-6 space-y-2">
                    <li>
                        <a
                            className="text-blue-700 underline visited:text-purple-900"
                            target="_blank"
                            href="https://remix.run/start/quickstart"
                            rel="noreferrer"
                        >
                            5m Quick Start
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-blue-700 underline visited:text-purple-900"
                            target="_blank"
                            href="https://remix.run/start/tutorial"
                            rel="noreferrer"
                        >
                            30m Tutorial
                        </a>
                    </li>
                    <li>
                        <a
                            className="text-blue-700 underline visited:text-purple-900"
                            target="_blank"
                            href="https://remix.run/docs"
                            rel="noreferrer"
                        >
                            Remix Docs
                        </a>
                    </li>
                </ul>
            </div >
        </div >
    );
}



// export function HamburgerMenu() {
//     return (
//         <>
//             <div className="hamburger">
//                 <div className="burger burger1" />
//                 <div className="burger burger2" />
//                 <div className="burger burger3" />
//             </div>

//             <style>{`
//             .hamburger{
//                 width: 2rem;
//                 height: 2rem;
//                 display: flex;
//                 justify-content: space-around;
//                 flex-flow: column nowrap;
//                 z-index: 10;
//             }

//             .burger {
//                 width: 2rem;
//                 height: 0.25rem;
//                 border-radius: 10px;
//                 background-color: black;
//                 transform-origin: 1px;
//                 transition: all 0.3s linear;
//             }
//             `}</style>
//         </>
//     )
// }