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
    // loop through each lesson
    for (const data in timetable) {
        const slot = timetable[data]
        console.log(`Subject: ${slot.subject_name}\nRoom: ${slot.room_name}\nTeacher: ${slot.teacher_name}\nStart time: ${slot.start_time}\nEnd time: ${slot.end_time}\n`)
    }
}

async function main() {
    let [uuid, token] = await getLoginToken();

    let timetable = await getTimetable(uuid, token);

    // testing purposes
    let now = 1762776000000

    for (const data in timetable) {
        const lesson = timetable[data]

        // remove timetabled slot if lesson has passed
        if (Date.parse(lesson.end_time) < now) {
            timetable.splice(data, 1)
        }
    }

    if (Object.keys(timetable).length > 1) {

        const timeToNextLesson = Date.parse(timetable[1].start_time) - now

        if (timeToNextLesson < 600000) {
            // next lesson
            console.log(`Subject: ${timetable[1].subject_name}\nRoom: ${timetable[1].room_name}\nTeacher: ${timetable[1].teacher_name}\n`)
        } else {
            // current lesson
            console.log(`Subject: ${timetable[0].subject_name}\nRoom: ${timetable[0].room_name}\nTeacher: ${timetable[0].teacher_name}\n`)
        }
    }

}

main()
.catch(err => {
    console.error("Error in main: ", err);
    process.exit(1);
})
