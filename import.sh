echo "Importing $1 into $SPACEID-$ENV" 

contentful space import --space-id $SPACEID \
    --environment-id $ENV \
    --mt $ACCESSTOKEN \
    --content-file ./contents-migrations/$1.json \
    --skip-content-model true \
    --error-log-file ./scripts/error.log

