import type { ZodType } from "zod";

/**
 * Validates a raw API payload against a Zod schema at the service boundary.
 * Throws a domain-labelled error on mismatch so the cached data layer can
 * catch it and degrade gracefully (return null) instead of rendering NaN or
 * crashing on missing fields.
 */
export function validate<T>(
  schema: ZodType<T>,
  data: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid ${label} data: ${parsed.error.message}`);
  }
  return parsed.data;
}
