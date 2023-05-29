import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AddMusicDTO, CreateSessionDTO, CreateUserDTO } from "./app.dto";
import { PrismaService } from "./prisma/prisma.service";
import { Request, Response } from "express";


@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createSession(body: CreateSessionDTO, res: Response) {
    var { email, password } = body;
    var user = await this.prisma.user.findFirst({
      where: { email, password }
    });

    if (user == null)
      throw new NotFoundException("No corresponding user");

    var session = await this.prisma.session.create({
      data: { user_id: user.uuid }
    })

    res.setHeader("Set-Cookie", `SESSID=${session.uuid}`);
    res.end(JSON.stringify({
      status: "success"
    }));
    return {
      status: "success"
    };
  }

  async getUser(user_id: string) {
    var user = await this.prisma.user.findUnique({
      where: { uuid: user_id }
    })

    if (user == null)
      throw new NotFoundException("No such user");

    return {
      uuid: user.uuid, 
      email: user.email, 
      nickname: user.nickname
    };
  }

  async createUser(data: CreateUserDTO) {
    var user = await this.prisma.user.create({ data });
    var playlist = await this.prisma.playlist.create({
      data: { owner_id: user.uuid }
    });

    return {
      uuid: user.uuid, 
      nickname: user.nickname
    };
  }

  async getPlaylist(session_id: string) {
    var session = await this.prisma.session.findUnique({
      where: {uuid: session_id}, 
      include: {
        user: true
      }
    })

    if (session == null)
      throw new UnauthorizedException("No such session");

    var playlist = await this.prisma.playlist.findFirst({
      where: { owner_id: session.user.uuid }, 
      include: {
        musics: {
          orderBy: {
            created_at: "asc"
          }
        }
      }
    });

    if (playlist == null)
      throw new InternalServerErrorException();

    return {
      uuid: playlist.uuid, 
      musics: playlist.musics
    };
  }

  async addMusic(session_id: string, data: AddMusicDTO) {
    var { title, artist } = data;
    var session = await this.prisma.session.findUnique({
      where: {uuid: session_id}, 
      include: {
        user: {
          include: {
            playlist: true
          }
        }
      }
    })

    if (session == null || !session.user.playlist?.uuid)
      throw new UnauthorizedException("No such session");

    var music = await this.prisma.music.create({
      data: {
        title, 
        artist, 
        playlist_id: session.user.playlist.uuid
      }
    });

    return {
      uuid: music.uuid, 
      title: music.title, 
      artist: music.artist
    };
  }

  async deleteMusic(session_id: string, music_id: string) {
    var session = await this.prisma.session.findUnique({
      where: {uuid: session_id}, 
      include: {
        user: {
          include: {
            playlist: true
          }
        }
      }
    })

    if (session == null || !session.user.playlist?.uuid)
      throw new UnauthorizedException("No such session");

    var result = await this.prisma.music.deleteMany({
      where: {
        uuid: music_id, 
        playlist_id: session.user.playlist.uuid
      }
    });

    return {
      status: "success"
    };
  }
}
