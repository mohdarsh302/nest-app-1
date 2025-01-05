import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { StudentEntity } from './entities/student.entity';
import { StudentService } from './student.service';
import { AuthMiddleware } from './middleware/auth.middlewere';

@Controller('students')
export class StudentController {
    constructor(
        private readonly studentService: StudentService
    ){}

    // Get all students
    @Get()
    async findAll(): Promise<StudentEntity[]> {
        return await this.studentService.findAll();
    }

    // create student
    @Post()
    async create(@Body() student: Partial<StudentEntity>): Promise<StudentEntity> {
        return await this.studentService.create(student);
    }

    // get single
    @Get('/:id')
    async findOne(@Param('id') id: number): Promise<StudentEntity>{
        return await this.studentService.findOne(id); 
    }

    // update recorde
    @Patch('/:id')
    async update(@Param('id') id: number, @Body() student: Partial<StudentEntity>): Promise<StudentEntity>{
        return await this.studentService.updateStudent(id, student);
    }
    
    // delete
    @Delete('/:id')
    async delete(@Param('id') id: number): Promise<string>{
        const check = await this.studentService.deleteRecord(id);
        if(check){
            return 'Student deleted';
        }
    }

    // Login Student
    @Post('/auth/login')
    async login(@Body('email') email: string, @Body('password') password : string, @Body() student: Partial<StudentEntity>): Promise<StudentEntity>{
        //console.log(email, password);
        return await this.studentService.login(email, password, student);
    }

    @Get('/get/profile')
    async getProfile(@Req() req: Request) {
        const user = req['user']; // Extract `user` from request (added by middleware)
        //console.log(user);
        const student = await this.studentService.findOne(user.id);

        if (!student) {
        throw new NotFoundException('Student not found');
        }

        // Exclude sensitive fields like password
        const { password, token, ...profile } = student;

        return profile;
    }

    // logout
    @Post('logout')
    //@UseGuards(AuthMiddleware)
    async logout(@Req() req: Request, @Res() res: Response):Promise<any>{
        const student = req['user'];
        console.log('=====>>>>',student);
        const findStudent = await this.studentService.findOne(student.id);
        if (!findStudent) {
            throw new NotFoundException('Student not found');
        }
        const ack = await this.studentService.logout(findStudent.id);
        console.log('->', ack);
        //res.status(200).json({ message: 'Logged out successfully' });
        if(ack){
            return { message: "Logged out successfully"} ;
            
        }else{
            return { message: "Something went wrong" }  ;
        }
        
    }
}
