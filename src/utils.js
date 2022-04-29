import $ from "jquery";

// export let backendAddress = "http://0.0.0.0:8000/"
export let backendAddress = "http://orifish.tech:20011/"

export function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

export function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

export function checkToken(onSuccess, onFailure) {
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

export let getUserData = (onSuccess) => {
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

export let getTasks = (onSuccess) => {
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

export let login = (mail, pwd, onSuccess, onFailure) => {
    console.log("Logging in using utils.js")
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

export let addTask = (data, onSuccess, onFailure) => {
    // data: {name, level, content, parent_id, ddl, label}
    let nonNullData = {};
    for (let k in data) {
        if (data[k] !== "" && data[k] !== null) {
            nonNullData[k] = data[k];
        }
    }
    console.log("Submitting task!", nonNullData);
    $.ajax({
        url: backendAddress + "addtask",
        type: 'get',
        data: nonNullData,
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: onFailure,
        },
    })
}

export let delTask = (task_id, onSuccess, onFailure) => {
    console.log("Deleting task!", task_id);
    $.ajax({
        url: backendAddress + "deletetask",
        type: 'get',
        data: { task_id },
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: onFailure,
        },
    })
}

export let finishTask = (task_id, onSuccess, onFailure) => {
    console.log("Finishing task!", task_id);
    $.ajax({
        url: backendAddress + "finishtask",
        type: 'get',
        data: { task_id },
        xhrFields: { withCredentials: true },
        crossDomain: true,
        statusCode: {
            200: onSuccess,
            401: onFailure,
        },
    })
}



