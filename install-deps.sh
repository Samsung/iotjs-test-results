#! /bin/bash

# Copyright 2017-present Samsung Electronics Co., Ltd. and other contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Todo: eliminate unneccesary dependencies (e.g. genfs, libusb)
ubuntu_ver=$(lsb_release -rs)
if [ "$ubuntu_ver" = "14.04" ]; then
  echo "Ubuntu 14.04 is not supported"
  exit
fi
sudo apt-get install -y autoconf libtool gperf flex bison autoconf2.13
sudo apt-get install -y cmake libncurses-dev libusb-1.0-0-dev genromfs
sudo apt-get install -y libsgutils2-dev gcc-arm-none-eabi minicom
sudo apt-get install -y python-pip pylint pkg-config libssl-dev
sudo apt-get install -y libc6-armel-cross libc6-dev-armel-cross binutils-arm-linux-gnueabi libncurses5-dev
sudo apt-get install -y gcc-arm-linux-gnueabihf gcc-arm-linux-gnueabi
sudo apt-get install -y mosquitto
sudo apt-get install -y autotools-dev automake

sudo pip install paramiko pyserial pyrebase twisted
