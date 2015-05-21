#!/bin/bash -e 

docker build -t registry.infra.cbd.int:5000/chm-cbd-int git@github.com:scbd/chm.cbd.int.git
docker push     registry.infra.cbd.int:5000/chm-cbd-int

fleetctl stop  chm-cbd-int.service
fleetctl start chm-cbd-int.service
