import Migration from 'contentful-migration';

// https://github.com/contentful/contentful-migration/tree/master/examples
export = function (migration: Migration) {
	const address = migration.editContentType('address');

	// add postcode
	address.createField('suburb').name('suburb').type('Text');
};
