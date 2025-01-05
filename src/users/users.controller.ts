import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserEntity } from "./entities/user.entity";
import passport from "passport";
import { LoginDto } from "./dto/login.dto";

@Controller('users')
export class UsersController{
  constructor(
    private readonly usersService: UsersService
  ){}


  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAllUsers();
  }

  @Post()
  async create(@Body() userData: Partial<UserEntity>): Promise<UserEntity> {
      return await this.usersService.create(userData);
  }

  // get User
  @Get('/:id')
  async findUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity>{
    console.log(id); 
    return await this.usersService.findOne(id);
  }

  // update user
  @Patch('/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number,  @Body() userData: Partial<UserEntity>): Promise<UserEntity>{
    return await this.usersService.update(id, userData);
  }

  // first method for login
  // @Post('auth/login')
  // async userLogin(@Body('email') email : string, @Body('password') password: string): Promise<UserEntity>{
  //   return await this.usersService.userLogin(email, password);
  // }


  // using login Dto
  @Post('auth/login')
  async userLogin(@Body() loginDto: LoginDto): Promise<UserEntity>{
    return await this.usersService.userLogin(loginDto);
  }
  

}