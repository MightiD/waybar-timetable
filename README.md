# A waybar module designed to use a timetable from the class charts API

This module works with your class charts login code, and your date of birth, and it automatically gets your timetable

To start:

Install Node.js

Clone the repository:
```
git clone github.com/mightid/waybar-timetable
```
Insert your login details into `~/.config/timetable/config.json` in the format:
```json
{
  "code": "your-login-code",
  "dob": "yyyy-mm-dd"
}
```
Inside your `~/.config/waybar/config.jsonc` file, add a new custom module:
```jsonc
"cusom/timetable": {
  "return-type": "json",
  "exec": "node path-to-cloned-dir/index.js
}
```
and add `"custom/timetable"` to your list of modules

Hovering over the module in waybar will display a list of all your lessons and the corresponding room name for each lesson in the tooltip
