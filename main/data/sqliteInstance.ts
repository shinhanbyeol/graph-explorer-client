import sqlite3 from 'sqlite3';
import initSqls, { initTableCount } from './init';
import normalizeDDL from '../util/normalizeDDL';
import _ from 'lodash';

// sql lite instance for app database
class appDatabase {
  appData: sqlite3.Database;
  constructor(sqllitePath) {
    this.appData = new sqlite3.Database(sqllitePath, (err) => {
      if (err) {
        console.error(err.message);
      }
      try {
        // check if app database is exist // ko: 앱 데이터베이스가 존재하는지 확인합니다.
        this.appData
          .prepare(`SELECT * FROM sqlite_master WHERE type='table';`)
          .all((err, rows) => {
            if (rows.length < initTableCount) {
              console.log('need init app database');
              // init table check to ./init.ts
              initSqls.forEach((_sql, tableName) => {
                this.appData.exec(_sql, (err) => {
                  if (err) {
                    console.error(err.message);
                  }
                  console.log('init app database success');
                });
              });
            }
          });

        // check table schema and alter table if needed // ko: 테이블 스키마를 확인하고 필요에 따라 테이블을 변경합니다.
        initSqls.forEach((_sql, tableName) => {
          this.appData
            .prepare(
              `
          SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '${tableName}';
          `,
              (err) => {
                if (err) {
                  console.error(err.message);
                }
              },
            )
            .all((err, rows: { sql: string }[]) => {
              const originalSql = normalizeDDL(rows[0].sql);
              const initSql = normalizeDDL(_sql);

              if (originalSql !== initSql) {
                console.log(
                  `table ${tableName} is not same as init sql, need to altered table`,
                );
                /**
                 * 1. backup table drop if exists // ko: 백업 테이블이 존재하면 삭제
                 * 2. rename table to backup table // ko: 테이블 이름을 백업 테이블로 변경
                 * 3. create new table with init sql // ko: init sql로 새 테이블 생성
                 * 4. copy data from backup table to new table // ko: 백업 테이블에서 새 테이블로 데이터 복사
                 * 5. drop backup table // ko: 백업 테이블 삭제
                 */
                const updateQuery = `
                  DROP TABLE IF EXISTS ${tableName}_bak; 
                  ALTER TABLE ${tableName} RENAME TO ${tableName}_bak;
                  ${_sql}
                  INSERT INTO ${tableName} SELECT * FROM ${tableName}_bak;
                  DROP TABLE ${tableName}_bak;
                `;                
                this.appData.exec(updateQuery);
              }
            });
        });
      } catch (error) {
        console.error('error', error);
      }
    });
  }
}

export default appDatabase;
