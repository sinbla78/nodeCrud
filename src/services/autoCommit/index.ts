#!/usr/bin/env node
/**
 * Auto Commit Generator - 메인 진입점
 * GitHub 잔디 심기를 위한 자동 커밋 생성 도구
 */

import { parseArgs, createConfig, printHelp } from './cli';
import { generateCommits, estimateCommits } from './generator';
import { resetCommitData, checkGitStatus, getCurrentCommitCount } from './commit';

// 타입 및 유틸리티 내보내기
export * from './types';
export * from './utils';
export * from './messages';
export * from './commit';
export * from './generator';
export * from './cli';

/**
 * 메인 실행 함수
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    // 도움말 표시
    if (options.help) {
      printHelp();
      return;
    }

    // 카운터 초기화
    if (options.reset) {
      resetCommitData();
      return;
    }

    // Git 상태 확인
    const gitStatus = checkGitStatus();
    if (!gitStatus.isGitRepo) {
      console.error('❌ 현재 디렉토리는 Git 저장소가 아닙니다.');
      console.log('💡 git init 명령어로 저장소를 초기화하세요.');
      process.exit(1);
    }

    // 설정 생성
    const config = createConfig(options);

    // 예상 커밋 수 출력
    const estimatedCommits = estimateCommits(config);
    console.log(`\n📊 예상 커밋 수: 약 ${estimatedCommits}개`);
    console.log(`📈 현재 커밋 카운터: ${getCurrentCommitCount()}개\n`);

    // 커밋 생성 실행
    const result = generateCommits(config);

    // 종료 코드 설정
    if (result.failedCommits > 0 && result.successfulCommits === 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 오류 발생:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// CLI로 직접 실행된 경우에만 main 함수 실행
if (require.main === module) {
  main();
}

// 프로그래매틱 사용을 위한 기본 내보내기
export default {
  generateCommits,
  estimateCommits,
  parseArgs,
  createConfig,
  resetCommitData,
  checkGitStatus,
  getCurrentCommitCount,
};
