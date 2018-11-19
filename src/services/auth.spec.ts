import { expect } from 'chai';
import { container } from '../modules/container';
import { auth } from './auth';

class FakeUser {
  public constructor(public email: string, public password: string = 'password', public id: number = 1) {}
  public static getByEmail(email: string): FakeUser { return new FakeUser(email); }
}
container.set('model.user', FakeUser, true);

describe('Services', () => {
  describe('Auth', () => {
    it('Should be able to create token', (done) => {
      auth.attempt('user@test.com', 'password').then((data: any) => {
        expect(data.token).to.not.empty;
        done()
      });
    });
    it('Should be able to decode token', () => {

    })
  });
});