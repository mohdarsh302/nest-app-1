import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentEntity } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './middleware/auth.middlewere';

@Module({
  imports:[
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([StudentEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    })
  ],
  providers: [StudentService],
  controllers: [StudentController]
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthMiddleware)           // Apply middleware
    .forRoutes(
        'students/get/profile'
        ,'students/logout'
      )
  }

}
