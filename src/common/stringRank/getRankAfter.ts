import {
  DEFAULT_CHAR,
  DEFAULT_RANK,
  MAX_CHAR,
  MAX_CHAR_CODE,
} from './constants';

export const getRankAfter = (rank: string): string => {
  const length = rank.length;
  if (length === 0) return DEFAULT_RANK;
  const lastCharacterIndex = length - 1;
  let result = rank.substring(0, lastCharacterIndex);
  const rank1Char = rank.charCodeAt(lastCharacterIndex);
  if (rank1Char < MAX_CHAR_CODE - 1) {
    result += String.fromCharCode(Math.round((rank1Char + MAX_CHAR_CODE) / 2));
  } else if (rank1Char < MAX_CHAR_CODE) {
    result += MAX_CHAR;
  } else {
    result += `${rank[lastCharacterIndex]}${DEFAULT_CHAR}`;
  }

  return result;
};
