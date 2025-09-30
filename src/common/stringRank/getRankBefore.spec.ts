import { getRankBefore } from './getRankBefore';

describe('StringRank: getRankBefore', () => {
  it('should create a rank before the referenced rank', () => {
    const result1 = getRankBefore('LLLLLL');
    expect(result1).toEqual('GNNNNN');

    const result2 = getRankBefore('LLLLLZ');
    expect(result2).toEqual('GNNNNN');

    const result3 = getRankBefore('AN');
    expect(result3).toEqual('AH');

    const result4 = getRankBefore('AH');
    expect(result4).toEqual('AE');

    const result5 = getRankBefore('AE');
    expect(result5).toEqual('AC');

    const result6 = getRankBefore('AC');
    expect(result6).toEqual('AB');

    const result7 = getRankBefore('AB');
    expect(result7).toEqual('AAN');

    const result8 = getRankBefore('AAN');
    expect(result8).toEqual('AAH');
  });

  it('should be able to create a virtually infinite number of predecessors', () => {
    let start = 'AB';
    Array(1000)
      .fill(0)
      .forEach(() => {
        const result = getRankBefore(start);
        expect(result < start).toBeTruthy();
        start = result;
      });
  });
});
