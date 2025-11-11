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

    return timetable.data;
}

function parseTimetable(timetable) {
    for (const data in timetable) {
        const lesson = timetable[data]

        // remove timetabled slot if lesson has passed
        if (Date.parse(lesson.end_time) < Date.now()) {
            timetable.splice(data, 1)
        }
    }

    if (Object.keys(timetable).length > 1) {

        const timeToNextLesson = Date.parse(timetable[1].start_time) - Date.now()

        if (timeToNextLesson < 600000) {
            // next lesson
            return [timetable[1].subject_name,
                    timetable[1].room_name,
                    timeToNextLesson / 1000 / 60]
        }

    }
    return [timetable[0].subject_name, timetable[0].room_name, 0]
}

async function main() {
    let [uuid, token] = await getLoginToken();

    let timetable = await getTimetable(uuid, token);

    let [subject, room, timeToLesson] = parseTimetable(timetable)

    if (timeToLesson == 0) {
        console.log(`${subject} | ${room}`)
    } else {
        console.log(`${subject} | ${room} in ${timeToLesson}`)
    }

}

main()
.catch(err => {
    console.error("Error in main: ", err);
    process.exit(1);
})
