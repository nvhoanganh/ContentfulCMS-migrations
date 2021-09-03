# Run 1 single migration file to an env (for testing)

-   make sure you run `npm install` first
-   populate the `.env` file

```bash
npm run migratedev -- migrations/000_AddAddress.ts
npm run migratedev -- migrations/002_EditAddressAddSuburb.ts
```

# run all pending migrations

```bash
npm run migrate
```

This will:
- create a content model called `migrationHistory` in the destination environment if not exists
- run only the `new` scripts under `./migrations` folder 
- at the end, update the `migrationHistory` with all executed scripts
