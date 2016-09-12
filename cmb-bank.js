const request = require('request');
const async = require('async');
const url = require('url');
const querystring = require('querystring');

const cmbUrl = 'https://mon.cmb.fr';

function option(token) {
    return {
        method: 'POST',
        headers: {
            'Authentication': 'Bearer ' + token.id_token,
            'Authorization': 'Bearer ' + token.access_token,
            'X-Csrf-Token': token.access_token,
            'X-ARKEA-EFS': '01',
            'X-REFERER-TOKEN': 'RWDPART'
        },
        json: true
    }
}
function login(username, password) {
    return new Promise(function (resolve, reject) {
        request({
            url: cmbUrl + '/securityapi/tokens', //URL to hit
            method: 'POST',
            form: {
                accessCode: username,
                password: password,
                clientId: 'com.arkea.cmb.siteaccessible',
                redirectUri: cmbUrl + '/auth/checkuser',
                errorUri: cmbUrl + '/auth/errorauthn'
            }
        }, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if (httpResponse.statusCode != 200) {
                    reject({'status':httpResponse.statusCode, 'body':httpResponse.body})
                } else {
                    uloc = url.parse(httpResponse.headers.location);
                    token = querystring.parse(uloc.hash.substr(1));
                    resolve(token);
                }
            }
        })
    })
}

function synthesecomptes(token) {
    return new Promise(function (resolve, reject) {
        var options = option(token);
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = cmbUrl + '/domiapi/oauth/json/accounts/synthesecomptes';
        options_.body = {'typeListeCompte': 'COMPTE_SOLDE_COMPTES_CHEQUES'};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if (httpResponse.statusCode != 200) {
                    reject({'status':httpResponse.statusCode, 'body':httpResponse.body})
                } else {
                    resolve(httpResponse.body);
                }
            }
        })
    })
}

function infosPerson(token) {
    return new Promise(function (resolve, reject) {
        var options = option(token);

        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = cmbUrl + '/domiapi/oauth/json/edr/infosPerson';
        options_.body = {};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if (httpResponse.statusCode != 200) {
                 reject({'status':httpResponse.statusCode, 'body':httpResponse.body})
                } else {
                 resolve(httpResponse.body);
                }
            }
        })
    })
}

function pendingListOperations(index, token) {
    return new Promise(function (resolve, reject) {
        var options = option(token);

        if (Object.keys(options).length === 0 && options.constructor === Object) {
            reject('Need Login');
        }
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = cmbUrl + '/domiapi/oauth/json/accounts/pendingListOperations';
        options_.body = {"index": index, "indicateurVirementFlux": true, "callEtalis": true};
        options_.json = true;
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if (httpResponse.statusCode != 200) {
                    reject({'status':httpResponse.statusCode, 'body':httpResponse.body})
                } else {
                    resolve(httpResponse.body);
                }
            }
        })
    })
}

function logout(token) {
    return new Promise(function (resolve, reject) {
        var options_ = JSON.parse(JSON.stringify(options));
        options_.url = cmbUrl + '/securityapi/revoke';
        request(options_, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if (httpResponse.statusCode != 200) {
                    reject({'status':httpResponse.statusCode, 'body':httpResponse.body})
                } else {
                    resolve(httpResponse.body);
                }
            }
       })
    })
}

exports.login = login;
exports.synthesecomptes = synthesecomptes;
exports.infosPerson = infosPerson;
exports.pendingListOperations = pendingListOperations;
exports.logout = logout;