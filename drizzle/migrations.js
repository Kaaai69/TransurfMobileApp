// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo
// Bundle revision: 1 (includes the monotonic level_xp trigger in m0000).

import journal from './meta/_journal.json';
import m0000 from './0000_slim_richard_fisk.sql';

  export default {
    journal,
    migrations: {
      m0000
    }
  }
  
