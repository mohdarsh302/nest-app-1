import { ExecutionContext, Injectable, NestMiddleware, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../student.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly studentService: StudentService,
    ) {}

      async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.split(' ')[1]; // Extract the token
        try {
          const decoded = this.jwtService.verify(token); // Verify the token
          const studentFind = this.studentService.findOne(decoded.id);
          if(!studentFind || (await studentFind).token !== token){
            throw new NotFoundException('Invalid or expired token');
          }
          
          //req['user'] = decoded; // Attach the decoded payload to the request
          req['user'] = studentFind; // Attach the decoded payload to the request
          //req.user = studentFind;
          next();
        } catch (error) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }



    // async canActivate(context: ExecutionContext): Promise<boolean> {
    //     const request = context.switchToHttp().getRequest();
    //     const authHeader = request.headers.authorization;

    //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     throw new UnauthorizedException('Invalid token');
    //     }

    //     const token = authHeader.split(' ')[1];

    //     try {
    //     const decoded = this.jwtService.verify(token);
    //     const student = await this.studentService.findOne(decoded.id);

    //     if (!student || student.token !== token) {
    //         throw new UnauthorizedException('Invalid or expired token');
    //     }

    //     // Attach student to request object
    //     request.user = student;
    //     return true;
    //     } catch (error) {
    //     throw new UnauthorizedException('Unauthorized');
    //     }
    // }

}
