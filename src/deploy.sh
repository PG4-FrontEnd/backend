#!/bin/bash

# 기본 설정
REPOSITORY=/home/ec2-user/cicd_project
APP_NAME=cicd_project

cd $REPOSITORY

# 이전 프로세스 종료
echo "> 프로세스 종료 시도"
pm2 delete $APP_NAME 2>/dev/null || true

# node_modules 정리
echo "> Cleaning node_modules..."
rm -rf node_modules
rm -rf dist

# 의존성 설치
echo "> Installing dependencies..."
export NODE_OPTIONS="--max_old_space_size=512"
npm ci --production

# 빌드
echo "> Building application..."
npm run build

# PM2 실행
echo "> Starting application..."
pm2 start ecosystem.config.js --env production

sleep 5
pm2 list

# PM2 startup 설정
pm2 save

echo "> Deployment completed"