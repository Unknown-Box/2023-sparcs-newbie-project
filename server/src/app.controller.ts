import { Body, Controller, Delete, Get, Header, Param, Post, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { AppService } from "./app.service";
import { AddMusicDTO, CreateSessionDTO, CreateUserDTO } from "./app.dto";
import { Request, Response } from "express";


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("session")
  async createSession(@Body() body: CreateSessionDTO, @Res() res: Response) {
    return await this.appService.createSession(body, res);
  }

  @Post("users")
  @Header("Content-Type", "application/json")
  @UsePipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
      disableErrorMessages: false
    })
  )
  async createUser(@Body() body: CreateUserDTO) {
    return await this.appService.createUser(body);
  }

  @Get("users/:user_id")
  @Header("Content-Type", "application/json")
  async getUser(@Param("user_id") user_id: string) {
    return await this.appService.getUser(user_id);
  }

  @Get("playlist")
  @Header("Content-Type", "application/json")
  async getPlaylist(@Req() req: Request) {
    return await this.appService.getPlaylist(req.cookies?.SESSID);
  }

  @Post("playlist/music")
  @Header("Content-Type", "application/json")
  @UsePipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
      disableErrorMessages: false
    })
  )
  async addMusic(@Body() body: AddMusicDTO, @Req() req: Request) {
    return await this.appService.addMusic(req.cookies?.SESSID, body);
  }

  @Delete("playlist/music/:music_id")
  @Header("Content-Type", "application/json")
  async deleteMusic(@Param("music_id") music_id: string, @Req() req: Request) {
    return await this.appService.deleteMusic(req.cookies?.SESSID, music_id);
  }
}
