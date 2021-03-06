# noflo-runtime-postmessage

NoFlo runtime for `postMessage` communications, including:

* Opening a FBP client from a NoFlo app with connection to `window.opener`
* Opening NoFlo app as iframe

## Changes

* 0.13.0 (December 14th 2020)
  - Updated to NoFlo 1.4.0 model
* 0.12.0 (November 25th 2020)
  - Updated to NoFlo 1.3.0 model
* 0.11.0 (September 28th 2020)
  - Updated to NoFlo's new "Network drives graph" model available in NoFlo 1.2.0
* 0.10.1 (Sep 23 2018)
  - Exposed the `postMessage` baseclass via `require`
* 0.10.0 (March 22 2018)
  - Updated to FBP Protocol 0.7
  - Added new capabilities from FBP Protocol: `network:control`, `network:status`, `network:data`
