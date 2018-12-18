import { expect } from 'chai';
import { prettier } from '../../src/tools/format';

describe('prettier format', () => {
  it('format test pass', () => {
    expect(
      prettier(`  interface IFoo{  
      name: string    ,     // asdf
    }
      `)
    ).to.be.eq(`interface IFoo {\n  name: string; // asdf\n}\n`);
  });
});
