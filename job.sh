

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
export ENV=$FROMENV
export SPACEID=$FROMSPACEID
SOURCE_SPACEID=$FROMSPACEID
export ACCESSTOKEN=$FROMACCESSTOKEN

sh download.sh $1

# commit
echo " 🎉 Add and Commit ./contents-migrations/$1.json file"
git add ./contents-migrations/$1.json
git commit -am "Content ID $1 changed"

# create a PR using Github action
echo " 🎉 Pushing $1 branch to remote"
git push --set-upstream origin $1 || true
gh pr create --base master --title "Content $1 updated" --body "This Content was updated https://app.contentful.com/spaces/$SOURCE_SPACEID/entries/$1"

# uppload
# export ENV=$TOENV
# export SPACEID=$TOSPACEID
# export ACCESSTOKEN=$TOACCESSTOKEN

# sh scripts/import.sh $1
