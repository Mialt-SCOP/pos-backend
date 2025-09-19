import { UserDto } from './user.dto';
import { User } from './user.entity';

export const userToDto = (user: User): UserDto => ({
  id: user.id,
  displayName: user.displayName,
});
