let config = require(process.env.HOME + "/.config/timetable/config.json");

console.log(config);

fetch("https://www.classcharts.com/apiv2student/login", {
    "body": `code=${config.code}&dob=${config.dob}&recaptcha-token=no-token-available`,
    "method": "POST",
    "credentials": "include"
})
.then(res => {
    if (!res.ok) throw new Error("HTTP Error")
    return res.json()
})
.then(data => console.log(data))
.catch(err => console.error("Fetch error:", err));

