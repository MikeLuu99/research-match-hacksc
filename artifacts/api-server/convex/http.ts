import { httpRouter } from "convex/server";
import { authComponent, createAuth, siteUrl } from "./auth";

const http = httpRouter();
authComponent.registerRoutesLazy(http, createAuth, {
  cors: true,
  trustedOrigins: [siteUrl],
});
export default http;
