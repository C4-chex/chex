import { spawnSync } from 'node:child_process';

const raw = await new Promise((resolve, reject) => {
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', resolve);
  process.stdin.once('error', reject);
});
const credential = JSON.parse(raw);
const authEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0', SITES_GIT_AUTHORIZATION: `Authorization: Bearer ${credential.token}` };
function run(args, network = false) {
  const auth = network ? ['-c','credential.helper=','-c','http.extraHeader=','-c','http.followRedirects=false',`--config-env=http.${credential.remote_url}.extraHeader=SITES_GIT_AUTHORIZATION`] : [];
  const result = spawnSync('git', [...auth, ...args], { cwd: process.cwd(), env: authEnv, encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Git command failed').replaceAll(credential.token, '[redacted]'));
  return (result.stdout || '').trim();
}
try {
  run(['add','--all','--','.']);
  const changed = spawnSync('git',['diff','--cached','--quiet'],{cwd:process.cwd(),encoding:'utf8'}).status === 1;
  if (changed) run(['-c','user.name=Sites','-c','user.email=sites@users.noreply.openai.com','commit','-m','Update Site source']);
  const sha = run(['rev-parse','HEAD']);
  run(['push', credential.remote_url, `${sha}:refs/heads/${credential.branch}`], true);
  process.stdout.write(sha + '\n');
} catch (error) {
  process.stderr.write(String(error.message || error));
  process.exit(1);
}
