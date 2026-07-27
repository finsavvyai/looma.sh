// Test the new identity generation format
function generateDriverId() {
  // Simulate the first 8 characters of a hex public key
  const chars = '0123456789abcdef';
  let result = 'Driver-';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

console.log('Example new driver identities:');
for (let i = 0; i < 10; i++) {
  console.log(`- ${generateDriverId()}`);
}

console.log('\nOLD vs NEW Format:');
console.log('OLD: Shachar Dev Car (hardcoded)');
console.log('NEW: Driver-c3389b3e (dynamic)');
console.log('NEW: Driver-deadbeef (dynamic)');
console.log('NEW: Driver-a1b2c3d4 (dynamic)');