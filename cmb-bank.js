var request = require('request');
var async = require('async');

var token = {};
var options = {};

function login(username, password) {
    return new Promise(function (resolve, reject) {
        request({
            url: 'https://mon.cmb.fr/securityapi/tokens', //URL to hit
            method: 'POST',
            form: {
                accessCode: username,
                password: password,
                clientId: 'com.arkea.cmb.siteaccessible',
                redirectUri: 'https://mon.cmb.fr/auth/checkuser',
                errorUri: 'https://mon.cmb.fr/auth/errorauthn'
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                reject(token);
            } else {
                uloc = url.parse(response.headers.location)
                token = querystring.parse(uloc.hash.substr(1));

                options = {
                    method: 'POST',
                    headers: {
                        'Authentication': 'Bearer ' + token.id_token,
                        'Authorization': 'Bearer ' + token.access_token,
                        'X-Csrf-Token': token.access_token,
                        'X-ARKEA-EFS': '01',
                        'X-REFERER-TOKEN': 'RWDPART',
                    },
                    json: true,
                }

                var result = {};
                result.compte = [];
                result.livret = [];

                async.waterfall([
                    function (cb) {
                        console.log('start infosPerson');
                        infosPerson().then(function (user) {
                            result.user = user;
                            console.log('end infosPerson');
                            cb(null);
                        });
                    },
                    function (cb) {
                        console.log('start synthesecomptes');
                        synthesecomptes().then(function (accounts) {
                            for (account of accounts.listCompteTitulaireCotitulaire) {
                                switch (account.accountType) {
                                    case 'LIVRET':
                                        result.livret.push(account);
                                        break;
                                    case 'COURANT':
                                        result.compte.push(account);
                                        break;
                                }
                            }
                            Object.keys(accounts.listCompteMandataire).forEach(function (k) {
                                for (account of accounts.listCompteMandataire[k]) {
                                    switch (account.accountType) {
                                        case 'LIVRET':
                                            result.livret.push(account);
                                            break;
                                        case 'COURANT':
                                            result.compte.push(account);
                                            break;
                                    }
                                }
                            });
                            console.log('end synthesecomptes');
                            cb(null);
                        });
                    }
                    ,
                    function (cb) {
                        var comptes = [];
                        console.log('start pending');
                        async.map(result.compte, function(compte, callback) {
                            pendingListOperations(compte.index).then(function (res) {
                                compte.attente = res;
                                comptes.push(compte);
                                callback(null);
                            });
                        }, function(err, res){
                            console.log('stop pending');
                            result.compte = comptes;
                            cb(null);
                        });
                    }

                ], function (err, res) {
                    resolve(result);
                });

            }
        })
    })
};

function synthesecomptes() {
    return new Promise(function (resolve, reject) {
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        ;
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = 'https://mon.cmb.fr/domiapi/oauth/json/accounts/synthesecomptes';
        options_.body = {'typeListeCompte': 'COMPTE_SOLDE_COMPTES_CHEQUES'};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                resolve(httpResponse.body);
            }
        })
    })
}

function infosPerson() {
    return new Promise(function (resolve, reject) {
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        ;
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = 'https://mon.cmb.fr/domiapi/oauth/json/edr/infosPerson';
        options_.body = {};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                resolve(httpResponse.body);
            }
        })
    })
}

function pendingListOperations(index) {
    return new Promise(function (resolve, reject) {
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        ;
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = 'https://mon.cmb.fr/domiapi/oauth/json/accounts/pendingListOperations';
        options_.body = {"index": index, "indicateurVirementFlux": true, "callEtalis": true};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                resolve(httpResponse.body);
            }
        })
    })
}


exports.login = login;
