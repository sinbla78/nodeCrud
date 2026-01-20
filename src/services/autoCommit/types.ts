/**
 * 커밋 자동화 서비스 타입 정의
 */

// 커밋 설정 인터페이스
export interface CommitConfig {
  startDate: Date;
  endDate: Date;
  minCommitsPerDay: number;
  maxCommitsPerDay: number;
  excludeWeekends: boolean;
  messageCategory?: MessageCategory;
  customMessages?: string[];
  dryRun?: boolean;
}

// 커밋 데이터 인터페이스
export interface CommitData {
  lastUpdate: string;
  commitCount: number;
  message: string;
  history?: CommitHistory[];
}

// 커밋 히스토리 인터페이스
export interface CommitHistory {
  date: string;
  message: string;
  timestamp: number;
}

// 커밋 결과 인터페이스
export interface CommitResult {
  success: boolean;
  date: Date;
  message: string;
  error?: string;
}

// 생성 결과 인터페이스
export interface GeneratorResult {
  totalCommits: number;
  successfulCommits: number;
  failedCommits: number;
  startDate: string;
  endDate: string;
  duration: number;
  results: CommitResult[];
}

// 메시지 카테고리 타입
export type MessageCategory =
  | 'general'
  | 'feature'
  | 'bugfix'
  | 'docs'
  | 'refactor'
  | 'test'
  | 'chore'
  | 'mixed';

// CLI 옵션 인터페이스
export interface CLIOptions {
  start?: string;
  end?: string;
  min?: number;
  max?: number;
  noWeekends?: boolean;
  category?: MessageCategory;
  dryRun?: boolean;
  help?: boolean;
  reset?: boolean;
}

// 시간대 설정
export interface TimeRange {
  startHour: number;
  endHour: number;
}

// 기본 설정값
export const DEFAULT_CONFIG: Partial<CommitConfig> = {
  minCommitsPerDay: 1,
  maxCommitsPerDay: 5,
  excludeWeekends: false,
  messageCategory: 'mixed',
  dryRun: false,
};

export const DEFAULT_TIME_RANGE: TimeRange = {
  startHour: 9,
  endHour: 22,
};
