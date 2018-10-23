# Network monitor [![Build Status](https://travis-ci.com/jakemarsden/network-monitor.svg?branch=master)](https://travis-ci.com/jakemarsden/network-monitor)

A simple web application for viewing information gathered by [ntopng](https://github.com/ntop/ntopng).

## Setup

1. Create a MySQL database and configure *ntopng* to dump to it
(see [here](https://github.com/ntop/ntopng/wiki/03-MySQL-FAQ))
1. Create a new MySQL user for the app with SELECT privileges for *ntopng*'s database
1. Clone this repo
1. Create a file named `app-secret.config.js` based on `app-secret.config.js.placeholder`
1. Install dependencies, build and start with
    - `npm ci`
    - `npm run build`
    - `npm run start`
