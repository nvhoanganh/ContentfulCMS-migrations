echo "Downloading $1 from $SPACEID-$ENV" 

contentful space export --space-id $SPACEID \
    --environment-id $ENV \
    --mt $ACCESSTOKEN \
    --export-dir ./contents-migrations \
    --content-file $1.json \
    --include-archived false \
    --skip-content-model true \
    --skip-roles true \
    --skip-webhooks true \
    --query-assets "sys.id=empty" \
    --query-entries "sys.id=$1" \
    --download-assets false \
    --error-log-file ./scripts/error.log

