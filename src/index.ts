import { Elysia } from "elysia";
import * as mongoose from 'mongoose';
import { auth } from "osu-api-extended";
import { getUser, searchUser } from "./controllers/users";
import { getMedals, updateMedals } from "./controllers/medals";
import { Mode } from "./models/user";

const mongo_uri: string = process.env.MONGO_URI as any;
const osu_id: number = parseInt(process.env.OSU_ID as any);
const osu_secret: string = process.env.OSU_SECRET as any;

const green = '\x1b[32m%s\x1b[0m';
const red = '\x1b[31m%s\x1b[0m';

mongoose.connect(mongo_uri)
  .then(() => console.log(green , "[ OK ] Connected to MongoDB"))
  .catch((err) => {
    console.log(red, "[ EE ] Couldn't connect to MongoDB");
    console.log(err)
  });

function routine(): void {
  auth.login(osu_id, osu_secret, ["public"])
    .then((res) => {
      if (res?.expires_in) {
        console.log(green, "[ OK ] Connected to osu!API");
      } else {
        console.log(red, "[ EE ] Couldn't connect to osu!API");
        console.log(res);
      }
    })
    .catch((err) => console.log(err));

  updateMedals();
}

routine();
setInterval(() => routine(), 1000 * 60 * 60 * 23);

// done 3/11

const app = new Elysia()
.get("/", () => "Bon dia i bon' hora!")
.group("/web", (app) => app
  .get("/login", () => "Login Page")
  .get("/logout", () => "Logout Page")
  .get("/is_logged_in", () => "Is Logged In Page")
)
.group("/users", (app) => app
  .get("/", () => "Users Page")
  .get("/search/:query", (req) => searchUser(req.params.query))
  .get("/:id", (req) => getUser(req.params.id))
  .get("/:id/:mode", (req) => getUser(req.params.id, req.params.mode as Mode))
  .get("/:id/beatmaps", () => "User Beatmaps Page")
  .get("/:id/scores", () => "User Scores Page")
  .get("/:id/scores/:mode", () => "User Scores Page")
  .get("/:id/most_played", () => "User Most Played Page")
)
.group("/beatmaps", (app) => app
  .get("/", () => "Beatmaps Page")
  .get("/:id", (req) => `Beatmap ID: ${req.params.id}`)
  .get("/:id/scores", () => "Beatmap Scores Page")
)
.get("medals", () => getMedals())
.listen(5000);

console.log(green, `[ OK ] Server is running at port ${app.server?.port}`);
