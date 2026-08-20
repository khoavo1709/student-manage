import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./lib/env";
import { errorHandler } from "./middlewares/errorHandler";
import apiRouter from "./routes/index";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
