// Script para generar hashes de contraseñas
// Uso: node scripts/generate-password-hash.js <password>

const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('\n=== Password Hash Generator ===\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL para actualizar usuario:');
  console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE cedula = 'TU_CEDULA';`);
  console.log('');
}

const password = process.argv[2] || 'admin123';
generateHash(password);
