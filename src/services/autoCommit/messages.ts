/**
 * 커밋 메시지 템플릿
 */

import { MessageCategory } from './types';
import { getRandomElement } from './utils';

// 일반 메시지
const generalMessages: string[] = [
  'Update project files',
  'Minor improvements',
  'Code maintenance',
  'Update configuration',
  'Improve code quality',
  'Clean up codebase',
  'Optimize implementation',
  'Enhance functionality',
  'Update dependencies',
  'Apply best practices',
];

// 기능 관련 메시지
const featureMessages: string[] = [
  'Add new feature',
  'Implement new functionality',
  'Add user interface component',
  'Create new module',
  'Add API endpoint',
  'Implement data handler',
  'Add validation logic',
  'Create service layer',
  'Add helper functions',
  'Implement core feature',
];

// 버그 수정 메시지
const bugfixMessages: string[] = [
  'Fix bug',
  'Fix minor issue',
  'Resolve edge case',
  'Fix validation error',
  'Correct logic flow',
  'Fix null reference',
  'Resolve race condition',
  'Fix memory leak',
  'Correct calculation',
  'Fix type error',
];

// 문서 관련 메시지
const docsMessages: string[] = [
  'Update documentation',
  'Add code comments',
  'Update README',
  'Add API documentation',
  'Improve inline docs',
  'Add usage examples',
  'Update changelog',
  'Document configuration',
  'Add troubleshooting guide',
  'Update contributing guide',
];

// 리팩토링 메시지
const refactorMessages: string[] = [
  'Refactor code',
  'Improve code structure',
  'Simplify implementation',
  'Extract common logic',
  'Reduce complexity',
  'Improve readability',
  'Apply DRY principle',
  'Optimize performance',
  'Clean up dead code',
  'Reorganize modules',
];

// 테스트 관련 메시지
const testMessages: string[] = [
  'Add tests',
  'Update test cases',
  'Improve test coverage',
  'Add unit tests',
  'Add integration tests',
  'Fix failing tests',
  'Add edge case tests',
  'Refactor test suite',
  'Add mock implementations',
  'Update test fixtures',
];

// 기타 작업 메시지
const choreMessages: string[] = [
  'Update dependencies',
  'Bump version',
  'Update build config',
  'Configure CI/CD',
  'Update package.json',
  'Add gitignore entries',
  'Configure linter',
  'Update tsconfig',
  'Setup development tools',
  'Update environment config',
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
