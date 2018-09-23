# noflo-runtime-postmessage [![Build Status](https://travis-ci.org/noflo/noflo-runtime-postmessage.svg?branch=master)](https://travis-ci.org/noflo/noflo-runtime-postmessage) [![Greenkeeper badge](https://badges.greenkeeper.io/noflo/noflo-runtime-postmessage.svg)](https://greenkeeper.io/)

NoFlo runtime for `postMessage` communications, including:

* Opening a FBP client from a NoFlo app with connection to `window.opener`
* Opening NoFlo app as iframe

## Changes

* 0.10.1 (Sep 23 2018)
  - Exposed the `postMessage` baseclass via `require`
* 0.10.0 (March 22 2018)
  - Updated to FBP Protocol 0.7
  - Added new capabilities from FBP Protocol: `network:control`, `network:status`, `network:data`
