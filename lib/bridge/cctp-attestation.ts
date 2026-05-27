import {
  ATTESTATION_API_URL,
  ATTESTATION_POLL_INTERVAL_MS,
  ATTESTATION_TIMEOUT_MS,
} from './cctp-types';

interface AttestationResponse {
  attestation: string | null;
  status: 'complete' | 'pending_confirmations';
}

export async function pollAttestation(
  messageHash: string,
  signal?: AbortSignal
): Promise<string> {
  const deadline = Date.now() + ATTESTATION_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      throw new Error('Attestation polling aborted');
    }

    try {
      const res = await fetch(`${ATTESTATION_API_URL}/${messageHash}`, { signal });

      if (res.status === 404) {
        await sleep(ATTESTATION_POLL_INTERVAL_MS);
        continue;
      }

      if (!res.ok) {
        await sleep(ATTESTATION_POLL_INTERVAL_MS);
        continue;
      }

      const data: AttestationResponse = await res.json();

      if (data.status === 'complete' && data.attestation) {
        return data.attestation;
      }

      await sleep(ATTESTATION_POLL_INTERVAL_MS);
    } catch (err) {
      if (signal?.aborted) throw err;
      await sleep(ATTESTATION_POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    `Attestation timeout after ${ATTESTATION_TIMEOUT_MS / 1000}s. ` +
    `Message hash: ${messageHash}. Your funds are safe — retry later.`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
