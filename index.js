let config = require(process.env.HOME + "/.config/timetable/config.json");

let body = `code=${config.code.toUpperCase()}&dob=${config.dob}`

fetch("https://www.classcharts.com/apiv2student/login", {
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
    console.log(data)
})
.catch(err => console.error("Fetch error:", err));


