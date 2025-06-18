import useAppStore from "../app";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function catchStoreError<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  ...args: A
): Promise<T | undefined> {
  try {
    return await fn(...args);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    const { setError } = useAppStore.getState(); // access the store outside React
    const message =
      error instanceof Error ? error?.message : "Unexpected error";
    setError(message);
    console.error("Async Error:", error);
  }
}
