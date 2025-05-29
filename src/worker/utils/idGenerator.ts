/**
 * Generates a secure 9-digit ID using crypto
 * Range: 100000000 - 999999999
 */
export function generateProductId(): number {
  const min = 100000000; // 9 digits minimum
  const max = 999999999; // 9 digits maximum

  // Generate cryptographically secure random bytes
  const randomBytes = new Uint8Array(4);
  crypto.getRandomValues(randomBytes);

  // Convert bytes to number
  const randomValue = new DataView(randomBytes.buffer).getUint32(0, true);

  // Scale to our range
  const scaledValue = (randomValue / 0xffffffff) * (max - min) + min;

  return Math.floor(scaledValue);
}

/**
 * Generates a unique product ID with collision detection
 */
export async function generateUniqueProductId(db: D1Database): Promise<number> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const id = generateProductId();

    // Check if ID already exists
    const { results } = await db
      .prepare('SELECT id FROM products WHERE id = ? LIMIT 1')
      .bind(id)
      .all();

    if (results.length === 0) {
      return id; // ID is unique
    }

    attempts++;
  }

  throw new Error(
    'Failed to generate unique product ID after maximum attempts',
  );
}
