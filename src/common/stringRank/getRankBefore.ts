import { MIN_CHAR } from './constants';
import { getRankBetween } from './getRankBetween';

export const getRankBefore = (rank: string): string => {
  return getRankBetween(MIN_CHAR, rank);
};
