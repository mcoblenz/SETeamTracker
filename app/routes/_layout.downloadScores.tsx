import { Link } from "@remix-run/react";



export default function DownloadScores() {
    return (
        <div>
            <h2>Download scores</h2>
            <br />
            <Link to="/downloadScoresCSV" download reloadDocument className="underline">Download scores as a CSV</Link>
        </div >
    );
}