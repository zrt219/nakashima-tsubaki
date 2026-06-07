"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>500 - Internal Server Error</h1>
      <p>Something went wrong!</p>
      <pre style={{ color: "red", textAlign: "left", display: "inline-block" }}>
        {error.message}
      </pre>
    </div>
  );
}
