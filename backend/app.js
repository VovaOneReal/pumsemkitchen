import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import helmet from "koa-helmet";

const app = new Koa();
const router = new Router();

// Security and performance middleware
app.use(helmet());
app.use(compress());
app.use(cors());

// Request parsing middleware
app.use(bodyParser());

// Custom middleware demonstrating Koa's cascading
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// Root endpoint
router.get("/", (ctx) => {
  ctx.body = {
    message: "Welcome to the Koa.js Blog API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Koa server running on http://localhost:${PORT}`);
});
