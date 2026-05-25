<<<<<<< HEAD
import { randomInt } from 'crypto';

export function generateTempPassword(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const passwordLength = 10;
  let password = '';

  for (let index = 0; index < passwordLength; index++) {
    password += characters[randomInt(characters.length)];
  }

  return password;
=======
export function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10);
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export function generateStrongPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;

<<<<<<< HEAD
  const getRandomChar = (characters: string) =>
    characters[randomInt(characters.length)];

  const shuffle = (characters: string[]) => {
    for (let index = characters.length - 1; index > 0; index--) {
      const swapIndex = randomInt(index + 1);
      [characters[index], characters[swapIndex]] = [
        characters[swapIndex],
        characters[index],
      ];
    }

    return characters;
  };

  let password = '';
  // Ensure at least one character from each set
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // Shuffle the password with a cryptographically secure swap order
  return shuffle(password.split('')).join('');
=======
  let password = '';
  // Ensure at least one character from each set
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
}
