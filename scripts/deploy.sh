#!/bin/bash

set -e

# 기본 설정
REPOSITORY=/home/ec2-user/cicd_project
APP_NAME=cicd_project

cd $REPOSITORY

# 이전 프로세스 종료
echo "> 프로세스 종료 시도"
CURRENT_PID=$(pgrep -f $APP_NAME)

if [ -z "$CURRENT_PID" ]; then 
    echo "> 종료할 것 없음"
else 
    echo "강제종료"
    kill -15 $CURRENT_PID
    sleep 5
fi

# node_modules 정리
echo "> Cleaning node_modules..."
rm -rf node_modules dist

# 환경 변수 설정
export NODE_ENV=production

# 의존성 설치
echo "> Installing dependencies..."
npm ci

# 빌드
echo "> Building application..."
npm run build

# PM2 실행
echo "> Starting application..."
pm2 start dist/main.js --name $APP_NAME

pm2 list

echo "> Deployment completed"