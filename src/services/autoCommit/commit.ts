/**
 * Git 커밋 생성 로직
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { CommitData, CommitResult, CommitHistory } from './types';
import { formatDate } from './utils';

// 데이터 파일 경로
const DATA_FILE = path.join(process.cwd(), 'commit-data.json');

/**
 * 커밋 데이터 파일 읽기
 */
export function readCommitData(): CommitData | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('커밋 데이터 파일 읽기 실패:', error);
  }
  return null;
}

/**
 * 커밋 데이터 파일 쓰기
 */
export function writeCommitData(data: CommitData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * 커밋 데이터 초기화
 */
export function resetCommitData(): void {
  const initialData: CommitData = {
    lastUpdate: new Date().toISOString(),
    commitCount: 0,
    message: 'Data reset',
    history: [],
  };
  writeCommitData(initialData);
  console.log('✅ 커밋 데이터가 초기화되었습니다.');
}

/**
 * 단일 커밋 생성
 */
export function makeCommit(date: Date, message: string, dryRun: boolean = false): CommitResult {
  try {
    // 기존 데이터 읽기
    const existingData = readCommitData();
    const currentCount = existingData?.commitCount ?? 0;
    const history: CommitHistory[] = existingData?.history ?? [];

    // 새 히스토리 항목 추가
    const newHistory: CommitHistory = {
      date: date.toISOString(),
      message,
      timestamp: Date.now(),
    };

    // 히스토리는 최근 100개만 유지
    const updatedHistory = [...history, newHistory].slice(-100);

    // 새 데이터 객체 생성
    const data: CommitData = {
      lastUpdate: date.toISOString(),
      commitCount: currentCount + 1,
      message,
      history: updatedHistory,
    };

    if (dryRun) {
      console.log(`[DRY RUN] Would commit: ${formatDate(date)} - ${message}`);
      return {
        success: true,
        date,
        message,
      };
    }

    // 데이터 파일 업데이트
    writeCommitData(data);

    // 파일 스테이징
    execSync('git add commit-data.json', { stdio: 'pipe' });

    // 특정 날짜로 커밋 생성
    const dateStr = date.toISOString();
    const env = {
      ...process.env,
      GIT_AUTHOR_DATE: dateStr,
      GIT_COMMITTER_DATE: dateStr,
    };

    execSync(`git commit -m "${message}"`, { env, stdio: 'pipe' });

    return {
      success: true,
      date,
      message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      date,
      message,
      error: errorMessage,
    };
  }
}

/**
 * Git 저장소 상태 확인
 */
export function checkGitStatus(): { isGitRepo: boolean; hasChanges: boolean; branch: string } {
  try {
    // Git 저장소인지 확인
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });

    // 현재 브랜치 확인
    const branch = execSync('git branch --show-current', { stdio: 'pipe' })
      .toString()
      .trim();

    // 변경사항 확인
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString();
    const hasChanges = status.length > 0;

    return {
      isGitRepo: true,
      hasChanges,
      branch,
    };
  } catch {
    return {
      isGitRepo: false,
      hasChanges: false,
      branch: '',
    };
  }
}

/**
 * 커밋 히스토리 가져오기
 */
export function getRecentCommits(count: number = 10): string[] {
  try {
    const log = execSync(`git log --oneline -${count}`, { stdio: 'pipe' }).toString();
    return log.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * 현재 커밋 카운트 가져오기
 */
export function getCurrentCommitCount(): number {
  const data = readCommitData();
  return data?.commitCount ?? 0;
}
