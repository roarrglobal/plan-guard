/**
 * Shared input validation utilities for edge functions
 * Provides schema validation and sanitization to prevent injection attacks
 */

// Maximum input sizes to prevent resource exhaustion
export const MAX_TEXT_SIZE = 50000; // 50KB for text content
export const MAX_BASE64_SIZE = 7000000; // ~5MB for base64 images (encoded)
export const MIN_TEXT_LENGTH = 10;
export const MIN_PLAN_LENGTH = 20;

/**
 * Sanitize user input to prevent prompt injection
 * Removes or escapes potentially dangerous patterns
 */
export function sanitizeForPrompt(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Truncate to max size
  let sanitized = input.slice(0, MAX_TEXT_SIZE);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Validate string input with length constraints
 */
export function validateString(
  value: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
  } = {}
): { valid: true; value: string } | { valid: false; error: string } {
  const { minLength = 0, maxLength = MAX_TEXT_SIZE, fieldName = 'Input' } = options;
  
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { valid: true, value: sanitizeForPrompt(trimmed) };
}

/**
 * Validate base64 encoded data with size constraints
 */
export function validateBase64(
  value: unknown,
  options: {
    maxSize?: number;
    fieldName?: string;
  } = {}
): { valid: true; value: string } | { valid: false; error: string } {
  const { maxSize = MAX_BASE64_SIZE, fieldName = 'File' } = options;
  
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a base64 string` };
  }
  
  if (value.length > maxSize) {
    // Calculate approximate original size (base64 is ~4/3 larger)
    const approxOriginalMB = Math.round((maxSize * 3 / 4) / 1024 / 1024);
    return { valid: false, error: `${fieldName} exceeds maximum size of ~${approxOriginalMB}MB` };
  }
  
  // Basic base64 validation
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    return { valid: false, error: `${fieldName} contains invalid base64 data` };
  }
  
  return { valid: true, value };
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  options: {
    fieldName?: string;
    defaultValue?: T;
  } = {}
): { valid: true; value: T } | { valid: false; error: string } {
  const { fieldName = 'Value', defaultValue } = options;
  
  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return { valid: true, value: defaultValue };
    }
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const normalized = value.toLowerCase() as T;
  
  if (!allowedValues.includes(normalized)) {
    return { valid: false, error: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
  }
  
  return { valid: true, value: normalized };
}

/**
 * Validate optional object structure
 */
export function validateObject(
  value: unknown,
  options: {
    fieldName?: string;
    required?: boolean;
  } = {}
): { valid: true; value: Record<string, unknown> | null } | { valid: false; error: string } {
  const { fieldName = 'Object', required = false } = options;
  
  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, value: null };
  }
  
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an object` };
  }
  
  return { valid: true, value: value as Record<string, unknown> };
}

/**
 * Validate MIME type for images
 */
export function validateMimeType(
  value: unknown,
  options: {
    fieldName?: string;
  } = {}
): { valid: true; value: string } | { valid: false; error: string } {
  const { fieldName = 'MIME type' } = options;
  
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
  ];
  
  if (!allowedMimeTypes.includes(value)) {
    return { valid: false, error: `${fieldName} must be a valid image type` };
  }
  
  return { valid: true, value };
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  error: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
