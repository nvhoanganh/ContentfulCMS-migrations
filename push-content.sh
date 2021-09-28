fileChanges=$(git diff HEAD~1 --name-only | grep contents-migrations)
echo " 🎉 Importing $fileChanges into $SPACEID-$ENV" 

node_modules/.bin/contentful space import --space-id $SPACEID \
    --environment-id $ENV \
    --mt $ACCESSTOKEN \
    --content-file ./$fileChanges \
    --skip-content-model true \
    --error-log-file ./scripts/error.log

