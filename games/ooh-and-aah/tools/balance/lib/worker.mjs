// worker_threads entry for tools/balance/analyze.mjs: loads the SIM once, then plays the jobs it
// is sent and posts the run records back. A job that throws comes back as {ok:false, error}.
import { parentPort, workerData } from 'worker_threads';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { loadSim } = require('./sim-loader.cjs');
const { makeRunner } = require('./runner.cjs');

let api = null;
const runners = {};
function runner(driver) {
  if (!runners[driver]) runners[driver] = makeRunner(api, { driver, simSponsor: workerData.simSponsor });
  return runners[driver];
}
try {
  api = loadSim(workerData.sim);
  runner(workerData.driver);
  parentPort.postMessage({ type: 'ready', kind: api.kind });
} catch (e) {
  parentPort.postMessage({ type: 'fatal', error: String((e && e.stack) || e) });
}

parentPort.on('message', m => {
  if (!m || m.type !== 'jobs') return;
  const out = [];
  for (const job of m.jobs) {
    try {
      const d = job.driver === 'other' ? (workerData.driver === 'sim' ? 'spec' : 'sim') : job.driver === 'native' ? 'native' : workerData.driver;
      const rec = d === 'native' ? runner(workerData.driver).nativeRun(job) : runner(d).playRun(job);
      rec.driver = d;
      out.push({ ok: true, rec });
    } catch (e) {
      out.push({ ok: false, cfg: job.cfg, seed: job.seed, error: String((e && e.message) || e), stack: String((e && e.stack) || '').split('\n').slice(0, 5).join(' | ') });
    }
  }
  parentPort.postMessage({ type: 'done', id: m.id, out });
});
