
import $ from "jquery";

let backendAddress = "http://0.0.0.0:8000/"

function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function checkToken(onSuccess, onFailure) {
    if (getCookie('token') === null) {
        onFailure();
    } else {
        $.ajax({
            url: backendAddress,
            type: 'get',
            data: null,
            xhrFields: { withCredentials: true },
            crossDomain: true,
            statusCode: {
                200: onSuccess,
                401: onFailure,
            },
        })
    }
}

let getUserData = (onSuccess) => {
    console.log("Getting user data!")
    $.ajax({
        url: backendAddress + "userinfo",
        type: 'get',
        data: null,
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: () => {
                console.error("Failed to get the user info.")
            },
        },
    })
}

let getTasks = (onSuccess) => {
    console.log("Getting tasks!")
    $.ajax({
        url: backendAddress + "gettask",
        type: 'get',
        data: null,
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: () => {
                console.error("Failed to get tasks.")
            },
        },
    })
}

let login = (mail, pwd, onSuccess, onFailure) => {
    $.ajax({
        url: backendAddress + "login",
        type: 'get',
        data: { mail, pwd, },
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: onFailure,
        },
    })
}


export { backendAddress, setCookie, getCookie, checkToken, getUserData, login, getTasks };