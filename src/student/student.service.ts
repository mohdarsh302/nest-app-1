import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/student.entity';
import * as bcrypt from 'bcrypt';
import { response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { promises } from 'dns';

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(StudentEntity)
        private readonly studentRepository: Repository<StudentEntity>,
        private readonly jwtService: JwtService, // Inject JWT service
    ){}

    // Find all students
    async findAll(): Promise<StudentEntity[]> {
    return await this.studentRepository.find();
  }

  // create student
  async create(student: Partial<StudentEntity>): Promise<StudentEntity> {
    try {
        if (!student.password) {
            throw new BadRequestException('Password is required');
        }
        // Encrypt the password
        const saltRounds = 10;
        student.password = await bcrypt.hash(student.password, saltRounds);

        const newStudent = await this.studentRepository.create(student);
        const savedStudent = await this.studentRepository.save(newStudent);
        // return await this.studentRepository.save(newStudent);
        if(!savedStudent){
            throw new BadRequestException('Student could not be created');
        }
        return savedStudent;
    } catch (error) {
        throw new BadRequestException(error.message || 'Failed to create student');
    }
  }

  // get findOne
  async findOne(id: number): Promise<StudentEntity>{
    const student = await this.studentRepository.findOne({ where: { id } });
    if(!student){
        throw new NotFoundException(`Student with ID ${id} not exists`);
    }else{
        return student;
    }
    
  }

  // update
  async updateStudent(id: number, student: Partial<StudentEntity>): Promise<StudentEntity>{
    try {
        if(!student.password){
            throw new BadRequestException('Password is required');
        }
        // Encrypt the password
        const saltRounds = 10;
        student.password = await bcrypt.hash(student.password, saltRounds);
        const findStudent = await this.studentRepository.findOne({ where:{id}});
        if(!findStudent){
            throw new NotFoundException(`Student with ID ${id} not exists`);
        }
        await this.studentRepository.update(id, student);
        return this.findOne(id);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  // delete
  async deleteRecord(id: number): Promise<boolean>{
    try {
        const findStudent = await this.findOne(id);
        if(!findStudent){
            throw new NotFoundException(`Student with ID ${id} not exists`);
        }
        await this.studentRepository.delete(id);
        return true;
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  // login
  async login(email: string, password: string, strudent: Partial<StudentEntity>){
    try {
        if(!email || !password){
            throw new BadRequestException('Email and Password is required');
        }
        // Find the student by email
        const student = await this.studentRepository.findOne({ where: { email } });
        if (!student) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        // Generate JWT token
        const payload = { id: student.id, email: student.email };
        const token = this.jwtService.sign(payload);
        console.log(token);
        if(token){
            // Store the token in the database
            student.token = token;
            await this.studentRepository.save(student);
            student.password=null;
        }
        // const rersponse  = {
        //     name: student.name,
        //     email: student.email,
        //     token:token
        // }
        // return { response };
        return student;
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  //logout
  async logout(id: number): Promise<boolean>{
    const student = await this.studentRepository.findOne({ where: { id: id } });
    if (!student) {
        throw new NotFoundException('Student not found');
    }
    //student.token = null;
    //await this.studentRepository.save(student);
    const updateStudent = true;
    if(updateStudent){
        return true;
    }else{
        return false;
    }
    //return { message: 'Logged out successfully' };
  }
}
