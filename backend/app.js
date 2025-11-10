import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import helmet from "koa-helmet";
import pg from "pg";

const app = new Koa();
const router = new Router();

// Security and performance middleware
app.use(helmet());
app.use(compress());
app.use(cors());

// Request parsing middleware
app.use(bodyParser());

// Root endpoint
router.post("/signin", (ctx) => {
  if (ctx.request.body.login.length < 3 || ctx.request.body.login.length > 32) {
    ctx.status = 400;
    ctx.body = {
      message: "Длина логина не подходит.",
    };
  } else if (
    ctx.request.body.password.length < 8 ||
    ctx.request.body.password.length > 32
  ) {
    ctx.status = 400;
    ctx.body = {
      message: "Длина пароля не подходит.",
    };
  } else {
    ctx.body = {
      message: "Добро пожаловать!",
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Koa server running on http://localhost:${PORT}`);
});
