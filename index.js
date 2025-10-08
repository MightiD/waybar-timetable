let config = require(process.env.HOME + "/.config/timetable/config.json");

let body = `code=${config.code.toUpperCase()}&dob=${config.dob}`

async function getLoginToken() {

    let login;

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

    return login
}

async function main() {
    let token = await getLoginToken();
    console.log(token);
}

main()
.catch(err => {
    console.error("Error in main: ", err);
    process.exit(1);
})
