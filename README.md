[![npm version](https://badge.fury.io/js/cmb-bank.svg)](https://badge.fury.io/js/cmb-bank) [![Dependency Status](https://david-dm.org/seb0uil/cmb-bank.svg)](https://david-dm.org/seb0uil/cmb-bank) [![npm](https://img.shields.io/npm/dm/cmb-bank.svg?maxAge=2592000)](https://www.npmjs.com/package/cmb-bank)

cmb-bank
================

Simple node module to get information of your [cmb](http://www.cmb.fr) account.

```bash
$ npm install cmb-bank
```

Then get json information of your account
```bash
 var cmb = require('cmb-bank');
 var token;

 cmb.login('user','password').then(function(result) {
  console.log(result);
  token = result;
 })

 cmb.infosPerson(token).then(function(result) {
  console.log(result);
 })
```


cmb-bank module exposes :
 * login
 * synthesecomptes
 * infosPerson
 * pendingListOperations
 * logout
