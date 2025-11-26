
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return passwordRegex.test(password);
}

export function validateName(name) {
  if (!name) return true; 
  if (typeof name !== 'string') return false;
  return name.trim().length <= 100;
}
