/**
 * Auto Commit - 간단한 진입점
 * 상세 구현은 src/services/autoCommit에 있습니다.
 */

// 모듈화된 서비스에서 가져오기
import autoCommit from './services/autoCommit';

// CLI로 실행될 때 자동으로 services/autoCommit/index.ts가 실행됨
// 이 파일은 하위 호환성을 위해 유지

export default autoCommit;
