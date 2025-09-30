import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import { HasherService } from '../hasher/hasher.service';
import { RegisterDto } from '../auth/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hasherService: HasherService,
  ) {}

  async register(createUserDto: RegisterDto): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.displayName = createUserDto.displayName;
    if (createUserDto.email) {
      user.email = createUserDto.email;
    }
    if (createUserDto.password) {
      user.password = await this.hasherService.hash(createUserDto.password);
    }
    return await this.usersRepository.save(user);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      loadEagerRelations: true,
      relationLoadStrategy: 'join',
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });
    if (!user) {
      return this.usersRepository.findOne({
        where: { email: username },
      });
    }
    return user;
  }

  async setNewPassword(user: User, newPassword: string) {
    user.password = await this.hasherService.hash(newPassword);
    return await this.usersRepository.save(user);
  }
}
