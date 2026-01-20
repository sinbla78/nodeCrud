/**
 * 커밋 생성기
 */

import { CommitConfig, CommitResult, GeneratorResult } from './types';
import { makeCommit, checkGitStatus } from './commit';
import { getRandomMessage, getRandomCustomMessage } from './messages';
import {
  formatDate,
  isWeekend,
  getRandomInt,
  createRandomDateTime,
  validateDateRange,
  validateCommitRange,
  showProgress,
  formatDuration,
  getDaysBetween,
} from './utils';

/**
 * 커밋 생성 실행
 */
export function generateCommits(config: CommitConfig): GeneratorResult {
  const startTime = Date.now();
  const {
    startDate,
    endDate,
    minCommitsPerDay,
    maxCommitsPerDay,
    excludeWeekends,
    messageCategory = 'mixed',
    customMessages,
    dryRun = false,
  } = config;

  // 유효성 검사
  validateDateRange(startDate, endDate);
  validateCommitRange(minCommitsPerDay, maxCommitsPerDay);

  // Git 상태 확인
  const gitStatus = checkGitStatus();
  if (!gitStatus.isGitRepo) {
    throw new Error('현재 디렉토리는 Git 저장소가 아닙니다.');
  }

  const results: CommitResult[] = [];
  const currentDate = new Date(startDate);
  const totalDays = getDaysBetween(startDate, endDate) + 1;
  let processedDays = 0;

  // 헤더 출력
  printHeader(config, gitStatus.branch, dryRun);

  // 날짜별 커밋 생성
  while (currentDate <= endDate) {
    processedDays++;

    // 주말 건너뛰기
    if (excludeWeekends && isWeekend(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // 오늘 생성할 커밋 수 결정
    const commitsToday = getRandomInt(minCommitsPerDay, maxCommitsPerDay);

    for (let i = 0; i < commitsToday; i++) {
      // 랜덤 시간 설정
      const commitDate = createRandomDateTime(currentDate);

      // 메시지 선택
      const message = customMessages && customMessages.length > 0
        ? getRandomCustomMessage(customMessages)
        : getRandomMessage(messageCategory);

      // 커밋 생성
      const result = makeCommit(commitDate, message, dryRun);
      results.push(result);

      if (!dryRun) {
        if (result.success) {
          showProgress(
            results.filter(r => r.success).length,
            totalDays * maxCommitsPerDay,
            '커밋 생성 중: '
          );
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  const generatorResult: GeneratorResult = {
    totalCommits: results.length,
    successfulCommits: results.filter(r => r.success).length,
    failedCommits: results.filter(r => !r.success).length,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    duration,
    results,
  };

  // 결과 출력
  printSummary(generatorResult, dryRun);

  return generatorResult;
}

/**
 * 헤더 출력
 */
function printHeader(config: CommitConfig, branch: string, dryRun: boolean): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           🌱 Auto Commit Generator                         ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  if (dryRun) {
    console.log('║  ⚠️  DRY RUN MODE - 실제 커밋이 생성되지 않습니다          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
  }

  console.log(`║  📅 기간: ${formatDate(config.startDate)} ~ ${formatDate(config.endDate)}`.padEnd(61) + '║');
  console.log(`║  📊 일일 커밋: ${config.minCommitsPerDay} ~ ${config.maxCommitsPerDay}개`.padEnd(61) + '║');
  console.log(`║  🌿 브랜치: ${branch}`.padEnd(61) + '║');
  console.log(`║  📝 메시지 카테고리: ${config.messageCategory || 'mixed'}`.padEnd(61) + '║');
  console.log(`║  🗓️  주말 제외: ${config.excludeWeekends ? '예' : '아니오'}`.padEnd(61) + '║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

/**
 * 결과 요약 출력
 */
function printSummary(result: GeneratorResult, dryRun: boolean): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 실행 결과                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  if (dryRun) {
    console.log(`║  ✅ 생성 예정 커밋: ${result.totalCommits}개`.padEnd(61) + '║');
  } else {
    console.log(`║  ✅ 성공한 커밋: ${result.successfulCommits}개`.padEnd(61) + '║');
    if (result.failedCommits > 0) {
      console.log(`║  ❌ 실패한 커밋: ${result.failedCommits}개`.padEnd(61) + '║');
    }
  }

  console.log(`║  ⏱️  소요 시간: ${formatDuration(result.duration)}`.padEnd(61) + '║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (!dryRun && result.successfulCommits > 0) {
    console.log('\n💡 Tip: git push 명령어로 원격 저장소에 푸시하세요!');
  }

  console.log('');
}

/**
 * 예상 커밋 수 계산
 */
export function estimateCommits(config: CommitConfig): number {
  const { startDate, endDate, minCommitsPerDay, maxCommitsPerDay, excludeWeekends } = config;

  let totalDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!excludeWeekends || !isWeekend(currentDate)) {
      totalDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const avgCommits = (minCommitsPerDay + maxCommitsPerDay) / 2;
  return Math.round(totalDays * avgCommits);
}
