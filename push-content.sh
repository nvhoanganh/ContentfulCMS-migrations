fileChanges=$(git diff HEAD~0 --name-only | grep contents-migrations)
if [ -z "$fileChanges" ]
then
    echo " ⭐️ no changes found"
else
    echo " 🎉 Importing $fileChanges into $SPACEID-$ENV"

    node_modules/.bin/contentful space import --space-id $SPACEID \
    --environment-id $ENV \
    --mt $ACCESSTOKEN \
    --content-file ./$fileChanges \
    --skip-content-model true \
    --error-log-file ./scripts/error.log
fi

