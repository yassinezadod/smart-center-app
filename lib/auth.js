// lib/auth.js

import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 12);
  } catch (error) {
    console.log('Error hashing password:', error.message);
    throw new Error('Hashing password failed');
  }
}

export async function verifyPassword(inputPassword, storedPassword) {
  try {
    return await bcrypt.compare(inputPassword, storedPassword);
  } catch (error) {
    console.error('Error verifying password:', error.message);
    throw new Error('Password verification failed');
  }
}

export async function comparePassword(plainPassword, hashedPassword) {
  return compare(plainPassword, hashedPassword);
}


