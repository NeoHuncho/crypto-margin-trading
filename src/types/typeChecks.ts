import { type AxiosError } from "axios";
export function isAxiosErrorWithResponseData(
  error: unknown,
): error is AxiosError<{ message: string }> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null
  );
}
