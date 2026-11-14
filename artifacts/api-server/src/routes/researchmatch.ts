import { Router, type IRouter } from "express";
import { GetResearchMatchStatusResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/researchmatch/status", (_req, res): void => {
  // Configuration is not connectivity: never claim a database is connected
  // merely because a URL exists.
  const configured = Boolean(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL);
  res.set("Cache-Control", "no-store");
  res.json(GetResearchMatchStatusResponse.parse({
    github: {
      status: "repository_linked",
      repositoryUrl: "https://github.com/MikeLuu99/research-match-hacksc",
    },
    convex: {
      status: configured ? "configured_unverified" : "not_configured",
      message: configured
        ? "A deployment URL is configured, but live connectivity and schema deployment have not been verified. The sample still uses local data."
        : "No Convex deployment URL is configured. Vector indexes and server-side matching groundwork are prepared; the sample uses browser-local data.",
    },
    matching: {
      mode: "local_demo",
      message: "Local text-vector similarity with explicit qualification checks. Not live AI embeddings or a connected vector database.",
    },
  }));
});

export default router;
