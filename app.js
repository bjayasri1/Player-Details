const express = require("express");
const app = express();

const { open } = require("sqlite");

const path = require("path");
const databasePath = path.join(__dirname, "cricketTeam.db");

const sqlite3 = require("sqlite3");

let db = null;


app.use(express.json());

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("sever Started successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET ALL PLAYERS DATA
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getAllPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

//post player data
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const dbQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES("${playerName}",${jerseyNumber},"${role}")`;
  const addPlayer = await db.run(dbQuery);
  response.send("Player Added to Team");
});

//add player details
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const addedPlayerDetails = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(eachPlayer)
    )
  );
});


//update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `UPDATE cricket_team SET player_name="${playerName}",jersey_number=${jerseyNumber},role="${role}" WHERE player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const delQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(delQuery);
  response.send("Player Removed");
});

module.exports = app;
