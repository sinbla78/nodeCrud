import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CommitConfig {
  startDate: Date;
  endDate: Date;
  minCommitsPerDay: number;
  maxCommitsPerDay: number;
  excludeWeekends: boolean;
}

const DATA_FILE = path.join(__dirname, '..', 'commit-data.json');

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function makeCommit(date: Date, message: string): void {
  // Update data file with timestamp
  const data = {
    lastUpdate: date.toISOString(),
    commitCount: fs.existsSync(DATA_FILE)
      ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).commitCount + 1
      : 1,
    message
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Stage the file
  execSync('git add commit-data.json');

  // Create commit with specific date
  const dateStr = date.toISOString();
  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: dateStr,
    GIT_COMMITTER_DATE: dateStr
  };

  execSync(`git commit -m "${message}"`, { env });
  console.log(`Committed: ${formatDate(date)} - ${message}`);
}

function generateCommits(config: CommitConfig): void {
  const { startDate, endDate, minCommitsPerDay, maxCommitsPerDay, excludeWeekends } = config;

  const currentDate = new Date(startDate);
  let totalCommits = 0;

  console.log('\n=== Auto Commit Generator ===');
  console.log(`Period: ${formatDate(startDate)} ~ ${formatDate(endDate)}`);
  console.log(`Commits per day: ${minCommitsPerDay} ~ ${maxCommitsPerDay}`);
  console.log(`Exclude weekends: ${excludeWeekends}\n`);

  while (currentDate <= endDate) {
    if (excludeWeekends && isWeekend(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const commitsToday = getRandomInt(minCommitsPerDay, maxCommitsPerDay);

    for (let i = 0; i < commitsToday; i++) {
      // Set random time during the day
      const commitDate = new Date(currentDate);
      commitDate.setHours(getRandomInt(9, 22));
      commitDate.setMinutes(getRandomInt(0, 59));
      commitDate.setSeconds(getRandomInt(0, 59));

      const messages = [
        'Update documentation',
        'Fix minor bug',
        'Refactor code',
        'Add new feature',
        'Improve performance',
        'Update dependencies',
        'Code cleanup',
        'Add tests',
        'Fix typo',
        'Update config'
      ];

      const message = messages[getRandomInt(0, messages.length - 1)];

      try {
        makeCommit(commitDate, message);
        totalCommits++;
      } catch (error) {
        console.error(`Failed to commit on ${formatDate(commitDate)}: ${error}`);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`\n=== Complete! Total commits: ${totalCommits} ===\n`);
}

// Parse command line arguments
function parseArgs(): CommitConfig {
  const args = process.argv.slice(2);

  // Default: last 30 days
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() - 30);

  let config: CommitConfig = {
    startDate: defaultStart,
    endDate: today,
    minCommitsPerDay: 1,
    maxCommitsPerDay: 5,
    excludeWeekends: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--start':
      case '-s':
        config.startDate = new Date(args[++i]);
        break;
      case '--end':
      case '-e':
        config.endDate = new Date(args[++i]);
        break;
      case '--min':
        config.minCommitsPerDay = parseInt(args[++i]);
        break;
      case '--max':
        config.maxCommitsPerDay = parseInt(args[++i]);
        break;
      case '--no-weekends':
        config.excludeWeekends = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Auto Commit Generator - GitHub 잔디 심기 도구

Usage:
  npm run commit:auto [options]

Options:
  -s, --start <date>    Start date (YYYY-MM-DD) [default: 30 days ago]
  -e, --end <date>      End date (YYYY-MM-DD) [default: today]
  --min <number>        Minimum commits per day [default: 1]
  --max <number>        Maximum commits per day [default: 5]
  --no-weekends         Skip weekends
  -h, --help            Show this help

Examples:
  npm run commit:auto
  npm run commit:auto -- -s 2024-01-01 -e 2024-12-31
  npm run commit:auto -- --min 2 --max 8 --no-weekends
        `);
        process.exit(0);
    }
  }

  return config;
}

// Main execution
const config = parseArgs();
generateCommits(config);
