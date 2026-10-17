// The job secret stays in the container environment, never in cron arguments.
const secret = process.env.JOBS_SECRET;
if (!secret) {
  console.error('Receipt retry job is not configured.');
  process.exitCode = 1;
} else {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/jobs/receipts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(90000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('Job failed.');
    const data = await response.json();
    if (typeof data.sent !== 'number' || data.configured !== true)
      throw new Error('Receipt delivery is not configured.');
    console.log(JSON.stringify({ sent: data.sent, configured: true }));
  } catch {
    console.error(
      'Receipt retry failed. Check job configuration and app health.',
    );
    process.exitCode = 1;
  }
}
