import { getRankBetween } from './getRankBetween';

describe('StringRank: getRankBetween', () => {
  it('should add a new character when 2 ranks are consecutives', () => {
    const result = getRankBetween('LLLLLL', 'LLLLLM');
    expect(result).toEqual('LLLLLLN');
  });
  it('should generate a string in the middle of the two reference strings', () => {
    const result1 = getRankBetween('LLLLLL', 'LLLLLN');
    expect(result1).toEqual('LLLLLM');

    const result2 = getRankBetween('LLLLLN', 'LLLLLL');
    expect(result2).toEqual('LLLLLM');

    const result3 = getRankBetween('LLLLLK', 'LLLLLO');
    expect(result3).toEqual('LLLLLM');

    const result4 = getRankBetween('LLLLLJ', 'LLLLLO');
    expect(result4).toEqual('LLLLLM');

    const result5 = getRankBetween('L', 'LLLLLO');
    expect(result5).toEqual('LGNNNN');

    const result6 = getRankBetween('LLLLLL', 'M');
    expect(result6).toEqual('LNNNNN');
  });
});
