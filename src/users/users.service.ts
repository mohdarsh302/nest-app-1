import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";



@Injectable()
export class UsersService{

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ){}


  async findAllUsers(): Promise<UserEntity[]>{
    return await this.userRepository.find();
  }

  // Create a new user
  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const { email, password } = userData;

    // Check for unique email
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new ConflictException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = this.userRepository.create({
        ...userData,
        password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async findOne(id: number): Promise<UserEntity>{
    try {
      const user = await this.userRepository.findOne({ where:{id}});
      console.log('==> ',user);
      if(user){
        return user;

      }else{
        throw new NotFoundException(`User with ID ${id} not exists`);
      }
      
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, userData: Partial<UserEntity>):Promise<UserEntity>{
    try {
        if(!userData.password){
          throw new BadRequestException('Password is required');
        }
        
        const findUser = this.userRepository.findOne({ where: {id}});
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        if(!findUser){
          throw new NotFoundException(`User with ID ${id} not exists`);
        }
        else{
          await this.userRepository.update(id, userData);
        }
        return this.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // login without dto
  // async userLogin(email: string, password: string): Promise<UserEntity>{
  //   try {
  //     if(!email || !password){
  //       throw new BadRequestException('email or password is required');
  //     }
  //     const user = await this.userRepository.findOne({ where:{ email}});
  //     if(!user){
  //       throw new UnauthorizedException('Invalid email or password');
  //     }
  //     const isPasswordValid = bcrypt.compare(password, user.password);
  //     if(!isPasswordValid){
  //       throw new UnauthorizedException('Invalid email or password');
  //     }
  //     const payload = { id: user.id, email: user.email, role:user.role };
  //     const token = this.jwtService.sign(payload);
  //     if(token){
  //       user.token = token;
  //       await this.userRepository.save( user);
  //       user.password = null;
  //     }
  //     return user;
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async userLogin(loginDto: LoginDto): Promise<UserEntity>{
    try {
      const { email, password} = loginDto;
      const user = await this.userRepository.findOne({ where:{ email}});
      if(!user){
        throw new UnauthorizedException('Invalid email or password');
      }
      const isPasswordValid = bcrypt.compare(password, user.password);
      if(!isPasswordValid){
        throw new UnauthorizedException('Invalid email or password');
      }
      const payload = { id: user.id, email: user.email, role:user.role };
      const token = this.jwtService.sign(payload);
      if(token){
        user.token = token;
        await this.userRepository.save( user);
        user.password = null;
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}