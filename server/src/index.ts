import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";


async function bootstrap() {
  const port = parseInt(process.env.port ?? "8000");
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(port);
}

bootstrap();
