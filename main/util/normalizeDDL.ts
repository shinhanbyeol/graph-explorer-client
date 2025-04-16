/**
 * @title DDL Normalization
 * @description DDL normalization makes it easier to compare. / DDL을 정규화하여 비교하기 쉽게 만듭니다.
 * @param ddl DDL script
 * @returns 
 */
export default function normalizeDDL(ddl) {
    return ddl
      .replace(/\s+/g, ' ')  // 여러 공백을 하나로
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/,\s*/g, ',')
      .replace(/CREATE TABLE IF NOT EXISTS/g, 'CREATE TABLE')
      .replace(/;/g, '')
      .toLowerCase()
      .trim();
  }