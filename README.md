cmb-bank is a module you can use if you get a [cmb](http://www.cmb.fr) account.

>var cmb = require('cmb-bank');
>var token;
>
>cmb.login('user','password').then(function(result) {
>  console.log(result);
>  token = result;
>})
>
>cmb.infosPerson(token).then(function(result) {
>  console.log(result);
>})

cmb exposes :
 : login
 : synthesecomptes
 : infosPerson
 : pendingListOperations
 : logout
