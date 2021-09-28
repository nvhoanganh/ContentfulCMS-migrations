# download
export ENV=$FROMENV
export SPACEID=$FROMSPACEID
export ACCESSTOKEN=$FROMACCESSTOKEN

sh scripts/download.sh $1

# uppload
export ENV=$TOENV
export SPACEID=$TOSPACEID
export ACCESSTOKEN=$TOACCESSTOKEN

sh scripts/import.sh $1
