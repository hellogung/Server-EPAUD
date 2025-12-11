import app from "./app";
import { Config } from "./config";

export default {
  port: Config.PORT,
  fetch: app.fetch,

  idleTimeout: 30,
  development: Config.ENVIRONTMENT
}