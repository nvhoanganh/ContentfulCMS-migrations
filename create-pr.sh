# create branch if not exists
if git branch --list -a | grep origin/$1; then
    echo " 🎉 Checking out remote branch $1"
    git branch -d $1 || true
    git checkout -b $1 origin/$1
else
    echo " 🎉 Creating new branch $1"
    git checkout -b $1 || true
fi

# download json for the content
echo " 🎉 Downloading $1.json from $SPACEID-$ENV"

node_modules/.bin/contentful space export --space-id $SPACEID \
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

# commit
echo " 🎉 Add and Commit ./contents-migrations/$1.json file"
git add ./contents-migrations/$1.json
git commit -am "Content ID $1 changed"

# create a PR using Github action
echo " 🎉 Pushing $1 branch to remote"
git push --set-upstream origin $1 || true
gh pr create --base master --title "Content $1 updated" --body "This Content was updated https://app.contentful.com/spaces/$SPACEID/entries/$1"