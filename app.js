const express = require("express");
const app = express();
app.use(express.json());

module.exports = app;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const startDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Online");
    });
  } catch (e) {
    console.lof(`DB ERROR :${e.message}`);
    process.exit(1);
  }
};
startDbAndServer();

//API 1

app.get("/players/", async (request, response) => {
  const getAllPlayersListQuery = `SELECT * FROM player_details ORDER BY player_id;`;
  const result = await db.all(getAllPlayersListQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  const responseObject = result.map((object) =>
    convertDbObjectToResponseObject(object)
  );

  response.send(responseObject);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const result = await db.get(getPlayerDetailsQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  const responseObject = convertDbObjectToResponseObject(result);

  response.send(responseObject);
});

// API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetailsQuery = `UPDATE player_details SET player_name = '${playerName}'  WHERE player_id=${playerId};`;
  await db.run(updatePlayerDetailsQuery);

  response.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const result = await db.get(getMatchDetailsQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };

  const responseObject = convertDbObjectToResponseObject(result);

  response.send(responseObject);
});

//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getAllMatchesOfPlayer = `SELECT * FROM match_details LEFT JOIN player_match_score ON match_details.match_id = player_match_score.match_id  WHERE player_id =${playerId};`;
  const result = await db.all(getAllMatchesOfPlayer);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };

  const responseObject = result.map((object) =>
    convertDbObjectToResponseObject(object)
  );

  response.send(responseObject);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersDetailsQuery = `SELECT * FROM player_match_score LEFT JOIN player_details ON player_match_score.player_id = player_details.player_id WHERE match_id=${matchId};`;
  const result = await db.all(getMatchPlayersDetailsQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  const responseObject = result.map((object) =>
    convertDbObjectToResponseObject(object)
  );

  response.send(responseObject);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreOfAllMatchesQuery = `
      SELECT player_details.player_id, player_details.player_name, SUM(player_match_score.score) AS total_score, SUM(player_match_score.fours) AS total_fours, SUM(player_match_score.sixes) AS total_sixes  FROM player_match_score LEFT JOIN player_details ON player_match_score.player_id = player_details.player_id WHERE player_details.player_id=${playerId};`;
  const result = await db.all(getPlayerScoreOfAllMatchesQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      totalScore: dbObject.total_score,
      totalFours: dbObject.total_fours,
      totalSixes: dbObject.total_sixes,
    };
  };

  const responseObject = result.map((object) =>
    convertDbObjectToResponseObject(object)
  );

  response.send(responseObject);
});
