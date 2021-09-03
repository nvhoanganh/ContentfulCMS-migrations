# Run 1 single migration file to an env
- make sure you run `npm install` first
```bash
npm run migratedev -- migrations/000_AddAddress.ts
npm run migratestaging -- migrations/000_AddAddress.ts
npm run migrateprod -- migrations/000_AddAddress.ts
npm run migratedev -- migrations/002_EditAddressAddSuburb.ts
```