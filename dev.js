const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '[QuizVerse Monorepo] Starting services...');

// Spawn Backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  shell: true,
  stdio: 'inherit'
});

// Spawn Frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: './frontend',
  shell: true,
  stdio: 'inherit'
});

// Handle graceful termination
const cleanup = () => {
  console.log('\n\x1b[31m%s\x1b[0m', '[QuizVerse Monorepo] Terminating backend and frontend processes...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
