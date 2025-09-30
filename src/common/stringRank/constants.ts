export const MIN_CHAR = 'A';
export const MAX_CHAR = 'Z';

export const MIN_CHAR_CODE = MIN_CHAR.charCodeAt(0);
export const MAX_CHAR_CODE = MAX_CHAR.charCodeAt(0);

export const DEFAULT_CHAR = String.fromCharCode(
  Math.round((MIN_CHAR.charCodeAt(0) + MAX_CHAR.charCodeAt(0)) / 2),
);

export const DEFAULT_RANK = `${DEFAULT_CHAR}${DEFAULT_CHAR}${DEFAULT_CHAR}${DEFAULT_CHAR}${DEFAULT_CHAR}${DEFAULT_CHAR}`;
