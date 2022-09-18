#!/usr/bin/env bash

REGISTRY=$1
TAG=$2

PREFIX=cr.yandex/${REGISTRY}
NAME=alice-news

docker buildx build \
    --build-arg PREFIX="${PREFIX}" \
    --build-arg TAG="${TAG}" \
    --platform linux/amd64 \
    -f Dockerfile \
    -t "${PREFIX}"/${NAME}:"${TAG}" \
    .
