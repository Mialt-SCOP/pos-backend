import { DEFAULT_CHAR, DEFAULT_RANK, MIN_CHAR_CODE } from './constants';

export const getRankBetween = (rank1: string, rank2: string): string => {
  if (rank1 > rank2) return getRankBetween(rank2, rank1);
  const rank1Length = rank1.length;
  const rank2Length = rank2.length;
  const length = Math.max(rank1Length, rank2Length);
  if (length === 0) return DEFAULT_RANK;
  let characterIndex = 0;
  let result = '';
  let isPrefixEqual = true;
  while (characterIndex < length) {
    const rank1Char =
      characterIndex < rank1Length
        ? rank1.charCodeAt(characterIndex)
        : MIN_CHAR_CODE;

    const rank2Char =
      characterIndex < rank2Length
        ? rank2.charCodeAt(characterIndex)
        : MIN_CHAR_CODE;

    if (rank1Char === rank2Char) {
      result += String.fromCharCode(rank1Char);
    } else if (isPrefixEqual) {
      if (rank2Char - rank1Char === 1) {
        result += String.fromCharCode(rank1Char);
        if (characterIndex === length - 1) {
          result += DEFAULT_CHAR;
        }
      } else {
        Math.round((rank1Char + rank2Char) / 2);

        result += String.fromCharCode(Math.round((rank1Char + rank2Char) / 2));
      }
      isPrefixEqual = false;
    } else {
      result += DEFAULT_CHAR;
    }
    ++characterIndex;
  }
  return result;
};
