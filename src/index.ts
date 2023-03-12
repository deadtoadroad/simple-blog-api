import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();
const port = process.env.EXPRESS_PORT;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
