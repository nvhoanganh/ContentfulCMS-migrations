echo "Creating new branch $1"

# create branch if not exists
git branch $1 || true

# check out to that branch
git checkout $1

# download json for the content
export ENV=$FROMENV
export SPACEID=$FROMSPACEID
export ACCESSTOKEN=$FROMACCESSTOKEN

sh scripts/download.sh $1

# commit
echo "Commit changes"
git commit -am "Content ID $1 updated"

# create a PR

# # uppload
# export ENV=$TOENV
# export SPACEID=$TOSPACEID
# export ACCESSTOKEN=$TOACCESSTOKEN

# sh scripts/import.sh $1
