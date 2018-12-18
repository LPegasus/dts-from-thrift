import { semverCompare } from "../../src/tools/semverCompare";
import { expect } from 'chai';

describe('semver compare test', () => {
  it('semver equal test', () => {
    expect(semverCompare('0.1.0', '0.1.0')).to.be.eq('=');
  });

  it('semver gt test', () => {
    expect(semverCompare('1.0.1', '0.1.0')).to.be.eq('>');
  });

  it('semver lt test', () => {
    expect(semverCompare('1.0.1', '2.1.0')).to.be.eq('<');
  });
});
