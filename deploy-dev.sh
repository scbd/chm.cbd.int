#!/bin/bash -e

docker build -t localhost:5000/dev-chm-cbd-int git@github.com:scbd/chm.cbd.int.git
docker push     localhost:5000/dev-chm-cbd-int
