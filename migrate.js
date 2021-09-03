require('dotenv').config();
var debug = require('debug')('migration');
const { runMigration } = require('contentful-migration');
const fs = require('fs');
const { execSync } = require('child_process');
const tblName = 'migrationHistory';
const migrationFolder = './migrations/';
const axios = require('axios').default;

// common headers
axios.defaults.baseURL = `https://api.contentful.com/spaces/${process.env.SPACEID}/environments/${process.env.ENV}`;
axios.defaults.headers.common[
	'Authorization'
] = `Bearer ${process.env.ACCESSTOKEN}`;

async function createMigrationTable() {
	debug('creating migration history table');
	await runMigration({
		migrationFunction: (migration, context) => {
			const history = migration.createContentType(tblName).name(tblName);

			const name = history.createField('history');
			name.name('history').type('Array').items({ type: 'Symbol' });
		},
		spaceId: process.env.SPACEID,
		accessToken: process.env.ACCESSTOKEN,
		yes: true,
	});
}

async function get(url) {
	const data = await axios.get(`${url}`);
	return data.data;
}

async function createEmptyHistoryEntry() {
	const data = await axios.post(
		`/entries`,
		{
			fields: {
				history: [],
			},
		},
		{
			headers: {
				'Content-Type': 'application/vnd.contentful.management.v1+json',
				'X-Contentful-Content-Type': tblName,
			},
		}
	);

	return await publishHistory(data.data.sys.id, 0);
}

async function publishHistory(id, currentVersion) {
	const update = await axios.put(`/entries/${id}/published`, null, {
		headers: {
			'X-Contentful-Version': currentVersion + 1,
		},
	});
	return update.data;
}

async function updateMigrationTable(id, updated, current) {
	if (JSON.stringify(updated) === JSON.stringify(current)) {
		debug(`Nothing is changed, skipping updating migration table`);
		return;
	}

	debug(`updating entry ${id}`, updated);
	const data = await axios.get(
		`/entries/${id}?access_token=${process.env.ACCESSTOKEN}`
	);

	// update
	let result = await axios.put(
		`/entries/${id}`,
		{
			fields: {
				history: {
					'en-US': updated,
				},
			},
		},
		{
			headers: {
				'X-Contentful-Content-Type': tblName,
				'X-Contentful-Version': data.data.sys.version,
			},
		}
	);

	return await publishHistory(id, data.data.sys.version);
}

async function createTableIfNotExists() {
	debug('start migration, checking if we have the migrationHistory table');
	try {
		let result = await get(`/content_types/${tblName}`);
		debug(JSON.stringify(result, null, 2));
	} catch (error) {
		if (
			error.response.data.sys.type === 'Error' &&
			error.response.data.message === 'The resource could not be found.'
		) {
			debug(`we don't have the table`);
			await createMigrationTable();
		} else {
			debug('Error Querying CMS', error.response.data);
			process.exit(1);
		}
	}
}

async function getCurrentMigrationHistory() {
	let result = await get(`/entries?content_type=migrationHistory`);
	debug(`current migration table`, JSON.stringify(result, null, 2));

	let migrationEntryId = '';
	let ranScripts = [];
	if (!result.items.length) {
		debug(`no entry found in migrationHistory, create new empty one`);
		result = await createEmptyHistoryEntry();
		debug(`migration entry created`, result);
		migrationEntryId = result.sys.id;
	} else {
		migrationEntryId = result.items[0].sys.id;
		ranScripts = result.items[0].fields.history?.['en-US'] || [];
	}

	debug('migration entry id', migrationEntryId);
	debug('ran scrips', ranScripts);
	return { migrationEntryId, ranScripts };
}

async function main() {
	await createTableIfNotExists();
	const { migrationEntryId, ranScripts } = await getCurrentMigrationHistory();

	fs.readdir(migrationFolder, async (err, files) => {
		let executed = [...ranScripts];

		for (let index = 0; index < files.length; index++) {
			const file = files[index];
			if (executed.indexOf(file) < 0) {
				debug(`running on ${process.env.ENV} >>>> ${file}`);
				const script = migrationFolder + file;

				try {
					const cmd = `./node_modules/.bin/ts-node node_modules/.bin/contentful-migration -s ${process.env.SPACEID} -a ${process.env.ACCESSTOKEN} -y -e ${process.env.ENV} ${script}`;
					const rs = execSync(cmd).toString();
					console.log(
						`running on ${process.env.ENV} >>>> ${file}: Success ✅`
					);

					executed.push(file);
				} catch (e) {
					console.error(`failed to run: ${file} ❌`);
					await updateMigrationTable(
						migrationEntryId,
						executed,
						ranScripts
					);
					return;
				}
			} else {
				console.log(`❌ skipping on ${process.env.ENV} >>>> ${file}`);
			}
		}

		await updateMigrationTable(migrationEntryId, executed, ranScripts);
		console.log(`Migration Completed Successfully 🔗 https://app.contentful.com/spaces/${process.env.SPACEID}/entries/${migrationEntryId}`);
	});
}

main();
