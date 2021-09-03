# Run 1 single migration file to an env (for testing)

-   make sure you run `npm install` first
-   populate the `.env` file

```bash
npm run migratedev -- migrations/000_AddAddress.ts
npm run migratedev -- migrations/002_EditAddressAddSuburb.ts

npm run migratestaging -- migrations/000_AddAddress.ts

npm run migrateprod -- migrations/000_AddAddress.ts
```

# run all pending migrations

```bash
npm run migrate
```
