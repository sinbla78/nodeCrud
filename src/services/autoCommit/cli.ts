/**
 * CLI 파서 및 도움말
 */

import { CommitConfig, CLIOptions, DEFAULT_CONFIG, MessageCategory } from './types';
import { parseDate } from './utils';
import { getCategories } from './messages';

/**
 * 명령줄 인수 파싱
 */
export function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-s':
      case '--start':
        options.start = nextArg;
        i++;
        break;

      case '-e':
      case '--end':
        options.end = nextArg;
        i++;
        break;

      case '--min':
        options.min = parseInt(nextArg);
        i++;
        break;

      case '--max':
        options.max = parseInt(nextArg);
        i++;
        break;

      case '--no-weekends':
      case '-w':
        options.noWeekends = true;
        break;

      case '-c':
      case '--category':
        options.category = nextArg as MessageCategory;
        i++;
        break;

      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;

      case '--reset':
        options.reset = true;
        break;

      case '-h':
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * CLI 옵션을 CommitConfig로 변환
 */
export function createConfig(options: CLIOptions): CommitConfig {
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() - 30);

  return {
    startDate: options.start ? parseDate(options.start) : defaultStart,
    endDate: options.end ? parseDate(options.end) : today,
    minCommitsPerDay: options.min ?? DEFAULT_CONFIG.minCommitsPerDay!,
    maxCommitsPerDay: options.max ?? DEFAULT_CONFIG.maxCommitsPerDay!,
    excludeWeekends: options.noWeekends ?? DEFAULT_CONFIG.excludeWeekends!,
    messageCategory: options.category ?? DEFAULT_CONFIG.messageCategory,
    dryRun: options.dryRun ?? DEFAULT_CONFIG.dryRun,
  };
}

/**
 * 도움말 출력
 */
export function printHelp(): void {
  const categories = getCategories().join(', ');

  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║              🌱 Auto Commit Generator - GitHub 잔디 심기 도구          ║
╚════════════════════════════════════════════════════════════════════════╝

사용법:
  npx ts-node src/services/autoCommit [options]
  npm run commit:auto [options]

옵션:
  -s, --start <date>      시작 날짜 (YYYY-MM-DD) [기본값: 30일 전]
  -e, --end <date>        종료 날짜 (YYYY-MM-DD) [기본값: 오늘]
  --min <number>          일일 최소 커밋 수 [기본값: 1]
  --max <number>          일일 최대 커밋 수 [기본값: 5]
  -w, --no-weekends       주말 제외
  -c, --category <type>   메시지 카테고리 [기본값: mixed]
                          사용 가능: ${categories}
  -d, --dry-run           실제 커밋 없이 시뮬레이션
  --reset                 커밋 카운터 초기화
  -h, --help              도움말 표시

예시:
  # 기본 실행 (최근 30일)
  npm run commit:auto

  # 특정 기간 지정
  npm run commit:auto -- -s 2024-01-01 -e 2024-06-30

  # 커밋 수와 카테고리 지정
  npm run commit:auto -- --min 2 --max 8 -c feature

  # 주말 제외하고 시뮬레이션
  npm run commit:auto -- --no-weekends --dry-run

  # 카운터 초기화
  npm run commit:auto -- --reset

주의사항:
  - 이 도구는 GitHub 잔디(contribution graph)를 위한 것입니다.
  - 과도한 사용은 스팸으로 간주될 수 있습니다.
  - 실제 프로젝트에는 의미 있는 커밋을 권장합니다.
`);
}

/**
 * 버전 정보 출력
 */
export function printVersion(): void {
  console.log('Auto Commit Generator v1.0.0');
}
