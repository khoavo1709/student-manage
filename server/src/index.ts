import app from "./app";
import { env } from "./lib/env";

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
