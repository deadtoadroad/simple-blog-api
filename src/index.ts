import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { app } from "./app";

dotenvExpand.expand(dotenv.config());
const port = process.env.EXPRESS_PORT;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
