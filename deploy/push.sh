#!/usr/bin/env bash

REGISTRY=$1
TAG=$2

PREFIX=cr.yandex/${REGISTRY}
NAME=alice-news

echo docker push "${PREFIX}"/${NAME}:"${TAG}"
docker push "${PREFIX}"/${NAME}:"${TAG}"
