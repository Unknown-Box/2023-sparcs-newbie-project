import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import path from "path";
import { PrismaModule } from "./prisma/prisma.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"]
    }), 
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "../../client/")
    }), 
    PrismaModule
  ], 
  controllers: [AppController], 
  providers: [AppService]
})
export class AppModule {}
