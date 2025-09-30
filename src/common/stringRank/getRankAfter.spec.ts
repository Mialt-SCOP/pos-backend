import { getRankAfter } from './getRankAfter';

describe('StringRank: getRankAfter', () => {
  it('should create a rank after the referenced rank', () => {
    const result1 = getRankAfter('LLLLLL');
    expect(result1).toEqual('LLLLLS');

    const result2 = getRankAfter('LLLLLZ');
    expect(result2).toEqual('LLLLLZN');

    const result3 = getRankAfter('Z');
    expect(result3).toEqual('ZN');
  });
});
