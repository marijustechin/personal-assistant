export const dynamic = "force-dynamic";

const apiUrl = process.env.API_URL ?? "http://localhost:4100";

type HealthResult =
  | { ok: true; httpStatus: number; body: string }
  | { ok: false; httpStatus?: number; body?: string; error: string };

async function getHealth(): Promise<HealthResult> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const body = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        httpStatus: response.status,
        body,
        error: `Backend responded with HTTP ${response.status}`,
      };
    }

    return { ok: true, httpStatus: response.status, body };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1>Personal Assistant</h1>
      <p className="subtitle">Empty application starter</p>

      <section className="card">
        <h2>Backend health</h2>
        <p className={`status ${health.ok ? "status-ok" : "status-error"}`}>
          {health.ok ? "ok" : "unavailable"}
        </p>
        <dl>
          <dt>Endpoint</dt>
          <dd>{apiUrl}/health</dd>
          {health.httpStatus !== undefined ? (
            <>
              <dt>HTTP status</dt>
              <dd>{health.httpStatus}</dd>
            </>
          ) : null}
          <dt>Response</dt>
          <dd>
            <code>
              {health.ok ? health.body : (health.body ?? health.error)}
            </code>
          </dd>
        </dl>
      </section>
    </main>
  );
}
