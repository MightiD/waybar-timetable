let config = require(process.env.HOME + "/.config/timetable/config.json");
const dns = require("dns").promises;

async function checkNetwork(interval = 5000) {
    while (true) {
        try {
            await dns.lookup("google.com");
            console.log("Network available");
            return;
        } catch {
            console.log("No network connection");
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}
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
    
    if (timetable.length > 1) {

        const timeToNextLesson0 = Date.parse(timetable[0].start_time) - Date.now()
        const timeToNextLesson1 = Date.parse(timetable[1].start_time) - Date.now()

        // next lesson is <10 mins away
        if (timeToNextLesson1 < 600000) {
            // next lesson
            return [timetable[1].subject_name,
                    timetable[1].room_name,
                    timeToNextLesson1 / 1000 / 60]
        // current lesson is free and next lesson is <10 mins away
        } else if (timeToNextLesson0 < 600000) {
            return [timetable[0].subject_name,
                    timetable[0].room_name,
                    timeToNextLesson0 / 1000 / 60]
        } else if (timeToNextLesson0 < Date.now()) {
            return ["Free Lesson", "", 0]
        }
    }

    return [timetable[0].subject_name, timetable[0].room_name, 0]
}

function printLesson(timetable) {
    let [subject, room, timeToLesson] = parseTimetable(timetable)

    if (room != "") {
        room = `( ${room})`
    }

    if (timeToLesson <= 0) {
        // current lesson
        console.log(`${subject}${room}`)
    } else {
        // next lesson
        console.log(`${subject}${room} in ${Math.ceil(timeToLesson)} minutes`)
    }
}

async function main() {
    await checkNetwork();

    let [uuid, token] = await getLoginToken();

    let timetable = await getTimetable(uuid, token);

    printLesson(timetable)

    // once a minute check for the lesson
    setInterval(() => {printLesson(timetable)}, 30000)
}

main()
.catch(err => {
    console.error("Error in main: ", err);
    process.exit(1);
})
