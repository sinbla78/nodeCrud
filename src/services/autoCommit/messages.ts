/**
 * 커밋 메시지 템플릿
 */

import { MessageCategory } from './types';
import { getRandomElement } from './utils';

// 일반 메시지
const generalMessages: string[] = [
  'chore :: update project files',
  'chore :: minor improvements',
  'chore :: code maintenance',
  'chore :: update configuration',
  'style :: improve code quality',
  'chore :: clean up codebase',
  'perf :: optimize implementation',
  'chore :: enhance functionality',
  'chore :: update dependencies',
  'style :: apply best practices',
];

// 기능 관련 메시지
const featureMessages: string[] = [
  'feat :: add new feature',
  'feat :: implement new functionality',
  'feat :: add user interface component',
  'feat :: create new module',
  'feat :: add API endpoint',
  'feat :: implement data handler',
  'feat :: add validation logic',
  'feat :: create service layer',
  'feat :: add helper functions',
  'feat :: implement core feature',
];

// 버그 수정 메시지
const bugfixMessages: string[] = [
  'fix :: resolve bug',
  'fix :: resolve minor issue',
  'fix :: handle edge case',
  'fix :: resolve validation error',
  'fix :: correct logic flow',
  'fix :: resolve null reference',
  'fix :: resolve race condition',
  'fix :: resolve memory leak',
  'fix :: correct calculation',
  'fix :: resolve type error',
];

// 문서 관련 메시지
const docsMessages: string[] = [
  'docs :: update documentation',
  'docs :: add code comments',
  'docs :: update README',
  'docs :: add API documentation',
  'docs :: improve inline docs',
  'docs :: add usage examples',
  'docs :: update changelog',
  'docs :: document configuration',
  'docs :: add troubleshooting guide',
  'docs :: update contributing guide',
];

// 리팩토링 메시지
const refactorMessages: string[] = [
  'refactor :: restructure code',
  'refactor :: improve code structure',
  'refactor :: simplify implementation',
  'refactor :: extract common logic',
  'refactor :: reduce complexity',
  'refactor :: improve readability',
  'refactor :: apply DRY principle',
  'perf :: optimize performance',
  'refactor :: clean up dead code',
  'refactor :: reorganize modules',
];

// 테스트 관련 메시지
const testMessages: string[] = [
  'test :: add tests',
  'test :: update test cases',
  'test :: improve test coverage',
  'test :: add unit tests',
  'test :: add integration tests',
  'test :: fix failing tests',
  'test :: add edge case tests',
  'test :: refactor test suite',
  'test :: add mock implementations',
  'test :: update test fixtures',
];

// 기타 작업 메시지
const choreMessages: string[] = [
  'chore :: update dependencies',
  'chore :: bump version',
  'build :: update build config',
  'ci :: configure CI/CD',
  'chore :: update package.json',
  'chore :: add gitignore entries',
  'chore :: configure linter',
  'chore :: update tsconfig',
  'chore :: setup development tools',
  'chore :: update environment config',
];

// 카테고리별 메시지 맵
const messagesByCategory: Record<MessageCategory, string[]> = {
  general: generalMessages,
  feature: featureMessages,
  bugfix: bugfixMessages,
  docs: docsMessages,
  refactor: refactorMessages,
  test: testMessages,
  chore: choreMessages,
  mixed: [
    ...generalMessages,
    ...featureMessages,
    ...bugfixMessages,
    ...docsMessages,
    ...refactorMessages,
    ...testMessages,
    ...choreMessages,
  ],
};

/**
 * 카테고리에 맞는 랜덤 커밋 메시지 반환
 */
export function getRandomMessage(category: MessageCategory = 'mixed'): string {
  const messages = messagesByCategory[category];
  return getRandomElement(messages);
}

/**
 * 커스텀 메시지 목록에서 랜덤 메시지 반환
 */
export function getRandomCustomMessage(customMessages: string[]): string {
  if (customMessages.length === 0) {
    return getRandomMessage('mixed');
  }
  return getRandomElement(customMessages);
}

/**
 * 모든 카테고리 목록 반환
 */
export function getCategories(): MessageCategory[] {
  return Object.keys(messagesByCategory) as MessageCategory[];
}

/**
 * 카테고리별 메시지 수 반환
 */
export function getMessageCount(category: MessageCategory): number {
  return messagesByCategory[category].length;
}

/**
 * 특정 카테고리의 모든 메시지 반환
 */
export function getMessagesByCategory(category: MessageCategory): string[] {
  return [...messagesByCategory[category]];
}
