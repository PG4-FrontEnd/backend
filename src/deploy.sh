#!/bin/bash

REPOSITORY=/home/ec2-user/cicd_project
APP_NAME=cicd_project
NODE_ENV=production
PORT=3000

cd $REPOSITORY

CURRENT_PID=$(pgrep -f $APP_NAME)

if [ -z "$CURRENT_PID" ]
then 
    echo "> 종료할 것 없음"
else
    echo "> kill -9 $CURRENT_PID"
    kill -15 $CURRENT_PID
    sleep 5
fi

CURRENT_PID=$(pgrep -f $APP_NAME)
if [ -n "$CURRENT_PID" ]; then
    echo "> Force kill process"
    kill -9 $CURRENT_PID
    sleep 2
fi

echo "> Installing dependencies..."
npm ci --production

echo "> Building application..."
npm run build

echo "> Starting application..."
NODE_ENV=$NODE_ENV PORT=$PORT pm2 start dist/main.js \
    --name $APP_NAME \
    --time \
    --watch \
    --max-memory-restart 1G

sleep 3
pm2 list

echo "> Deployment completed"