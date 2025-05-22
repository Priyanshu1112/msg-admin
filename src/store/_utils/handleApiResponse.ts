import useAppStore from "../app";

export function handleApiResponse(ok: boolean, fn: () => void) {
  const { setError } = useAppStore.getState();

  if (ok) {
    try {
      return fn();
    } catch (error) {
      setError(
        error instanceof Error ? error?.message : "Unexpected error occurred!"
      );
    }
  } else {
    setError("API response failed (res.ok = false)");
  }
}
