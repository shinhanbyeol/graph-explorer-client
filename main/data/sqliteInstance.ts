import sqlite3 from 'sqlite3';
import initSqls, { initTableCount } from './init';

// sql lite instance for app database
class appDatabase {
  appData: sqlite3.Database;
  constructor(sqllitePath) {
    this.appData = new sqlite3.Database(sqllitePath, (err) => {
      if (err) {
        console.error(err.message);
      }

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
            const originalSql = rows[0].sql;
            const initSql = _sql
              .replace(/CREATE TABLE IF NOT EXISTS/g, 'CREATE TABLE')
              .replace(/;/g, '');

            if (originalSql !== initSql) {
              console.log(
                `table ${tableName} is not same as init sql, need to alter table`,
              );
              // TODO: alter table 관련 작업 추가 필요
            }
          });
      });

      this.appData
        .prepare(`SELECT * FROM sqlite_master WHERE type='table';`)
        .all((err, rows) => {
          if (rows.length < initTableCount) {
            console.log('need init app database');
            // init table check to ./init.ts
            initSqls.forEach((_sql, tableName) => {
              this.appData.run(_sql, (err) => {
                if (err) {
                  console.error(err.message);
                }
                console.log('init app database success');
              });
            });
          }
        });
    });
  }
}

export default appDatabase;
