#!/bin/sh
# starts the php-server defined in the docker-compose file
# start the reacteditor

docker-compose up -d 
cd $PWD/webroot/reacteditor/
echo $cwd 
npm start 
