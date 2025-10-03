import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Delay = number | ((attempt: number) => number)

export interface RetryWithValidationOptions<T> {
  retries?: number
  delayMs?: Delay
  onError?: (error: unknown, attempt: number) => void | Promise<void>
  onValidationFailure?: (result: T, attempt: number) => void | Promise<void>
}

export async function retryWithValidation<T>(
  task: () => Promise<T>,
  validate: (result: T) => boolean | Promise<boolean>,
  options: RetryWithValidationOptions<T> = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.retries ?? 3)
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await task()
      const isValid = await validate(result)

      if (isValid) {
        return result
      }

      await options.onValidationFailure?.(result, attempt)
    } catch (error) {
      lastError = error
      await options.onError?.(error, attempt)
    }

    if (attempt >= maxAttempts) {
      break
    }

    const delay = options.delayMs
    const delayValue = typeof delay === "function" ? delay(attempt) : delay

    if (delayValue && delayValue > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayValue))
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error(`Validation failed after ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}.`)
}
