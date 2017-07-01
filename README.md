# arcticfox-monitor

[![Dependency Status](https://david-dm.org/hobbyquaker/arcticfox-monitor/status.svg)](https://david-dm.org/hobbyquaker/arcticfox-monitor)
[![devDependency Status](https://david-dm.org/hobbyquaker/arcticfox-monitor/dev-status.svg)](https://david-dm.org/hobbyquaker/arcticfox-monitor?type=dev)
[![Build Status](https://travis-ci.org/hobbyquaker/arcticfox-monitor.svg?branch=master)](https://travis-ci.org/hobbyquaker/arcticfox-monitor)
[![Github All Releases](https://img.shields.io/github/downloads/hobbyquaker/arcticfox-monitor/total.svg)]()

> A simple device monitoring tool for vape battery mods with Arcticfox firmware. Works on macOS and Linux.

![Screenshot](screenshot.png "Screenshot")


### Download

#### macOS

Go to the [latest release page](https://github.com/hobbyquaker/arcticfox-monitor/releases/latest) and download the 
arcticfox-monitor-x.x.x.dmg file.

#### Linux

On the [latest release page](https://github.com/hobbyquaker/arcticfox-monitor/releases/latest) you can find a .deb file 
for Ubuntu and Debian and a .tar.gz that should work on other distributions.


### Usage

Connect your Arcticfox Device, start the Application, vape on.


### Contributing

Clone the repo, do `npm install` in the project root. Use `npm start` to start the application in debug mode.
Depending on your installed Node.js version it might be necessary to rebuild the USB HID module:
`./node_modules/.bin/electron-rebuild`

If you want to build your own Node.js based application that communicates with the Arcticfox firmware you can use
https://github.com/hobbyquaker/arcticfox - a Node module that abstracts the communication and is also used by this
project.


### Credits

Based on the work of [NFE Team](https://nfeteam.org/)

* https://github.com/maelstrom2001/ArcticFox
* https://github.com/TBXin/NFirmwareEditor


This software uses [Highcharts](http://www.highcharts.com/) which is free __only for non-commercial use__.


### License

GPLv3

Copyright (c) Sebastian Raff
