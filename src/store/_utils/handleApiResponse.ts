import useAppStore from "../app";

export function handleApiResponse(
  ok: boolean,
  message: string,
  fn: () => void
) {
  const { setError, setSuccess } = useAppStore.getState();

  if (ok) {
    try {
      fn();
      if (message) setSuccess(message);
      return;
    } catch (error) {
      setError(
        error instanceof Error ? error?.message : "Unexpected error occurred!"
      );
    }
  } else {
    setError(message);
  }
}
