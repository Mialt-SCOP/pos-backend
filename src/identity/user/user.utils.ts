import { UserDto } from './user.dto';
import { User } from './user.entity';

export const userToDto = (user: User): UserDto => ({
  id: user.id,
  displayName: user.displayName,
  username: user.username,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
