import { useState, useEffect } from "react";
import { TeamScores } from "~/services/server";

interface TeamFeedbackProps {
  teamScores: TeamScores[];
  isAdmin: boolean;
  reportErrorStatus: (isError: boolean) => void;
}

export function TeamFeedback(props: TeamFeedbackProps) {
  const feedbackData = props.teamScores;

  const isAdmin = props.isAdmin;
  const team = feedbackData[0].forTeam;

  const [errors, setErrors] = useState(new Map());
  const [teamScores, setTeamScores] = useState(feedbackData);

  useEffect(() => {
    // Update scores state when feedbackData changes
    setTeamScores(feedbackData);
  }, [feedbackData]);

  const scoresMap : { [key: string]: number } = {
    "CICD": 30,
    "IssueTracking": 20,
    "VersionControl": 20,
    "Backlog": 15,
    "UserStory": 15
  };

  const handleTeamScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    week: number,
    field: string
  ) => {
    const value = parseFloat(e.target.value);
    const updateTeamScores = teamScores.map((score) => {
      return score.week === week ? { ...score, [field]: value } : score;
    });
    if (value < 0 || value > scoresMap[field]) {
      setErrors(
        new Map(errors.set(e.target.name, `Scores must be between 0 and ${scoresMap[field]}`))
      );
      props.reportErrorStatus(true);
    } else {
      errors.delete(e.target.name);
      if (errors.size == 0) {
        props.reportErrorStatus(false);
      }
      setErrors(new Map(errors));
    }
    setTeamScores(updateTeamScores);
  };


  return (
    <div>
      <div className="p-4">
        <h4>Staff Scores for Team {team}</h4>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>CICD</th>
              <th>Issue Tracking</th>
              <th>Version Control</th>
              <th>Backlog</th>
              <th>User Story</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {teamScores.map((teamScore) => {
              const total = (teamScore.CICD ?? 0) + (teamScore.IssueTracking ?? 0) + (teamScore.VersionControl ?? 0) + (teamScore.Backlog ?? 0) + (teamScore.UserStory ?? 0);

              return (
                <tr key={teamScore.week}>
                  <td>{teamScore.week}</td>
                  <td>
                    {isAdmin ? (
                      <input
                        name={"C" + team + "W" + teamScore.week}
                        type="number"
                        value={teamScore.CICD != null ? teamScore.CICD : ""}
                        onChange={(e) =>
                          handleTeamScoreChange(e, teamScore.week, "CICD")
                        }
                      />
                    ) : (teamScore.CICD)}
                    {errors.get("C" + team + "W" + teamScore.week) ? <div className="text-red-600">{errors.get("C" + team + "W" + teamScore.week)}</div> : (<></>)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        name={"K" + team + "W" + teamScore.week}
                        type="number"
                        value={
                          teamScore.IssueTracking != null
                            ? teamScore.IssueTracking
                            : ""
                        }
                        onChange={(e) =>
                          handleTeamScoreChange(
                            e,
                            teamScore.week,
                            "IssueTracking"
                          )} />) : (teamScore.IssueTracking)}
                    {errors.get("K" + team + "W" + teamScore.week) ? <div className="text-red-600">{errors.get("K" + team + "W" + teamScore.week)}</div> : (<></>)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        name={"V" + team + "W" + teamScore.week}
                        type="number"
                        value={
                          teamScore.VersionControl != null
                            ? teamScore.VersionControl
                            : ""
                        }
                        onChange={(e) =>
                          handleTeamScoreChange(
                            e,
                            teamScore.week,
                            "VersionControl"
                          )
                        }
                      />
                    ) : (
                      teamScore.VersionControl
                    )}
                    {errors.get("V" + team + "W" + teamScore.week) ? <div className="text-red-600">{errors.get("V" + team + "W" + teamScore.week)}</div> : (<></>)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        name={"B" + team + "W" + teamScore.week}
                        type="number"
                        value={
                          teamScore.Backlog != null ? teamScore.Backlog : ""
                        }
                        onChange={(e) =>
                          handleTeamScoreChange(e, teamScore.week, "Backlog")
                        }
                      />
                    ) : (
                      teamScore.Backlog
                    )}
                    {errors.get("B" + team + "W" + teamScore.week) ? <div className="text-red-600">{errors.get("B" + team + "W" + teamScore.week)}</div> : (<></>)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        name={"U" + team + "W" + teamScore.week}
                        type="number"
                        value={
                          teamScore.UserStory != null ? teamScore.UserStory : ""
                        }
                        onChange={(e) =>
                          handleTeamScoreChange(e, teamScore.week, "UserStory")
                        }
                      />
                    ) : (
                      teamScore.UserStory
                    )}
                    {errors.get("U" + team + "W" + teamScore.week) ? <div className="text-red-600">{errors.get("U" + team + "W" + teamScore.week)}</div> : (<></>)}
                  </td>
                  <td>{total} ({total.toFixed()}%)</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
