// Mock better-sqlite3 for deployment environments without native module support
class MockDatabase {
  data: Map<string, any[]> = new Map();
  statement: any;

  pragma() {}
  
  exec(sql: string) {
    // Simple mock - just log
    console.log('[MockDB] exec:', sql.substring(0, 100));
  }

  prepare(sql: string) {
    return {
      run: (...args: any[]) => ({ changes: 0, lastInsertRowid: 1 }),
      get: (...args: any[]) => ({ count: 0 }),
      all: (...args: any[]) => []
    };
  }

  close() {}
}

export default MockDatabase;
