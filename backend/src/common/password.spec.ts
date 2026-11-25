import { passwordProblem } from './password';

describe('passwordProblem', () => {
  const emails = ['jean.mugisha90@gmail.com', 'jean@acaciasafarisrwanda.com'];

  it('refuses a password with a name in it', () => {
    expect(passwordProblem('Mugisha2026!', 'Jean Mugisha', emails)).toContain(
      'mugisha',
    );
    expect(passwordProblem('xxÉric-123', 'Jean-Éric Uwase', [])).toContain(
      'eric',
    );
  });

  it('refuses a password with the email in it', () => {
    expect(
      passwordProblem('jeanmugisha90', 'Paul Kagame', [
        'jean.mugisha90@gmail.com',
      ]),
    ).not.toBeNull();
  });

  it('accepts a password without them', () => {
    expect(passwordProblem('Gorilla#Trek7', 'Jean Mugisha', emails)).toBeNull();
  });
});
