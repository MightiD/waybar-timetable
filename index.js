let config = require(process.env.HOME + "/.config/timetable/config.json");

async function getLoginToken() {
    let login;

    let body = `code=${config.code.toUpperCase()}&remember=true&dob=${config.dob}`

    await fetch("https://www.classcharts.com/apiv2student/login", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        "body": body,
        "method": "POST",
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP Error")
        console.log(res.headers.getSetCookie())
        return res.json();
    })
    .then(data => {
        login = data;
    })
    .catch(err => console.error("Fetch error:", err));

    if (login.success != 1) {
        console.error("Error logging in");
        process.exit(1);
    }

    //return login.meta.session_id
    return [login.data.id, login.meta.session_id];
}

async function getTimetable(uuid, token) {
    let timetable;

    await fetch(`https://www.classcharts.com/apiv2student/timetable/${uuid}`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "authorization": `Basic ${token}`,
            "x-requested-with": "XMLHttpRequest"
        },
        "method": "GET",
        "credentials": "include",
        "body": null,
        "referrer": "https://www.classcharts.com/mobile/student",
        "mode": "cors",
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP Error")
        return res.json()
    })
    .then(data => {
        timetable = data;
    })
    .catch(err => console.error("Fetch error:", err));

    return timetable;
}

async function main() {
    let [uuid, token] = await getLoginToken();

    console.log(uuid)
    console.log(token)

    let timetable = await getTimetable(uuid, token);

    console.log(timetable);
}

main()
.catch(err => {
    console.error("Error in main: ", err);
    process.exit(1);
})
