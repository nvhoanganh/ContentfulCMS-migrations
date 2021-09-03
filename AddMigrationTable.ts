import Migration from 'contentful-migration';

// https://github.com/contentful/contentful-migration/tree/master/examples
export = function (migration: Migration) {
	const historyTable = migration.editContentType('migrationHistory');

	historyTable.createField('scripts').name('scripts').type('Object');
};
