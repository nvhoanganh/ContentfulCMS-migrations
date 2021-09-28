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


# import and exporting content from one space to another space when content is changed
- run this to export and then import (we need SpaceId, Entity Id and Access token)
```bash

FROMENV=master \
FROMSPACEID=k9fnhvl1ymu1 \
FROMACCESSTOKEN=CFPAT-Rr9NDqFfVBTDRgqUfqIooxxCzYdLNDB_z2kT8-RLKLI \
TOENV=dev \
TOSPACEID=k9fnhvl1ymu1 \
TOACCESSTOKEN=CFPAT-Rr9NDqFfVBTDRgqUfqIooxxCzYdLNDB_z2kT8-RLKLI \
sh job.sh 4D1DcBWbPZKt2yBmyaWTzI

```

# setup
- create new github repo called `Amazon-Contentful`
- this repo has 2 folders under the root `ContentMigrations` and `ModelMigrations` and bunch of scripts (js + bash)
- icreate the following webhooks on `SPACE.TRUNK` for `master` env in Contentful:
- `content-changed`: when content is changed on `master` , use custom webhook payload which looks like this

```json
{
"entityId": "{ /payload/sys/id }",
"spaceId": "{ /payload/sys/space/sys/id }",
"updatedAt": "{ /payload/sys/updatedAt }",
}
```

- `asset-changed`: when asset is changed, use custom webhook payload

# when content is updated/created in Contentful:
- Contentful will make webhook call to Github Workflow Dispatch and this workflow dispatch will:
- extract updated/created content Id `4D1DcBWbPZKt2yBmyaWTzI` from the webhook
- create new branch called `4D1DcBWbPZKt2yBmyaWTzI-DDMMYYY` 
- run `contentful space export` cli command and update/create `4D1DcBWbPZKt2yBmyaWTzI.json` file under `ContentMigrations` folder
- create a PR from `4D1DcBWbPZKt2yBmyaWTzI-DDMMYYY` branch into `master` with a message like "Content ID 4D1DcBWbPZKt2yBmyaWTzI is updated/created. To review the updated content https://contentful.com/id=4D1DcBWbPZKt2yBmyaWTzI"
- set a required approver 

# when PR is approved and merged to Master
- use Git to figure out which json files are updated/added in `ContentMigrations` folder
- for each of the updated/created json file in `ContentMigrations` folder and execute `contentful space import` which push the updated content to `SPACE.CONTENT/Test` (automatic)
- in the same GH pipeline, we have 2 other stages: `release to PP` and `release to Prod`
- using release gate, when approved, changes will be pushed to PP and Prod (manual)