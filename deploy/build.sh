#!/usr/bin/env bash

REGISTRY=$1
TAG=$2

PREFIX=cr.yandex/${REGISTRY}
NAME=alice-news

docker build \
    --build-arg PREFIX="${PREFIX}" \
    --build-arg TAG="${TAG}" \
    -f Dockerfile \
    -t "${PREFIX}"/${NAME}:"${TAG}" \
    .
