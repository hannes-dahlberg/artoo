import { expect } from 'chai';
import { hash } from './hash';

describe('Services', () => {
  describe('Hash', () => {
    it('Should be able to create hash from random string', () => {
      // 1. Arrange
      const randomString = 'Hello World';

      // 2. Act
      const createdHash = hash.create(randomString);

      // 3. Assert
      expect(createdHash.length).to.equal(60);
    });

    it('Should be able to validate hash with random stirng', () => {
      // 1. Arrange
      const randomString = 'Hello World';

      // 2. Act
      const createdHash = hash.create(randomString);
      const hashCheck = hash.check(randomString, createdHash)

      // 3. Assert
      expect(hashCheck).to.equal(true);
    });
  })
});