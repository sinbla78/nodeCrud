/**
 * 커밋 자동화 유틸리티 함수
 */

import { TimeRange, DEFAULT_TIME_RANGE } from './types';

/**
 * 지정된 범위 내에서 랜덤 정수 반환
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 날짜를 한국어 형식으로 포맷
 */
export function formatDateKorean(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/**
 * 주말인지 확인
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 두 날짜 사이의 일 수 계산
 */
export function getDaysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
}

/**
 * 랜덤 시간이 설정된 새 Date 객체 생성
 */
export function createRandomDateTime(
  baseDate: Date,
  timeRange: TimeRange = DEFAULT_TIME_RANGE
): Date {
  const newDate = new Date(baseDate);
  newDate.setHours(getRandomInt(timeRange.startHour, timeRange.endHour));
  newDate.setMinutes(getRandomInt(0, 59));
  newDate.setSeconds(getRandomInt(0, 59));
  return newDate;
}

/**
 * 날짜 문자열을 Date 객체로 파싱
 */
export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`유효하지 않은 날짜 형식입니다: ${dateString}`);
  }
  return date;
}

/**
 * 날짜 범위 유효성 검사
 */
export function validateDateRange(start: Date, end: Date): void {
  if (start > end) {
    throw new Error('시작 날짜가 종료 날짜보다 늦을 수 없습니다.');
  }

  const today = new Date();
  if (end > today) {
    console.warn('⚠️  종료 날짜가 오늘 이후입니다. 미래 날짜의 커밋은 GitHub에서 인식되지 않을 수 있습니다.');
  }
}

/**
 * 커밋 수 범위 유효성 검사
 */
export function validateCommitRange(min: number, max: number): void {
  if (min < 0 || max < 0) {
    throw new Error('커밋 수는 0 이상이어야 합니다.');
  }
  if (min > max) {
    throw new Error('최소 커밋 수가 최대 커밋 수보다 클 수 없습니다.');
  }
  if (max > 50) {
    console.warn('⚠️  하루 최대 커밋 수가 50개를 초과합니다. GitHub에서 스팸으로 간주될 수 있습니다.');
  }
}

/**
 * 진행률 표시
 */
export function showProgress(current: number, total: number, prefix: string = ''): void {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round(barLength * (current / total));
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  process.stdout.write(`\r${prefix}[${bar}] ${percentage}% (${current}/${total})`);

  if (current === total) {
    console.log('');
  }
}

/**
 * 시간을 사람이 읽기 쉬운 형식으로 변환
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분 ${seconds % 60}초`;
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  }
  return `${seconds}초`;
}

/**
 * 배열에서 랜덤 요소 선택
 */
export function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)];
}
