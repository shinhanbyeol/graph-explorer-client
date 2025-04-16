const tb_servers = `
CREATE TABLE IF NOT EXISTS tb_servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_type TEXT,
  version TEXT,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  user TEXT NOT NULL,
  password TEXT NOT NULL,
  database TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const tb_workspaces = `
CREATE TABLE IF NOT EXISTS tb_workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id INTEGER NOT NULL,
  graph TEXT,
  name TEXT NOT NULL,
  sql_path TEXT,
  json_path TEXT,
  result_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const _initSqls: {
  tb_servers: string;
  tb_workspaces: string;
} = {
  tb_servers,
  tb_workspaces,
};

const initSqls = new Map(Object.entries(_initSqls));
export const initTableCount = Object.keys(initSqls).length;
export default initSqls;
