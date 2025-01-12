const {app, Menu} = require("electron");
const isMac = process.platform === "darwin";

const template =
[
    ...(isMac ? 
        [{
            label: "Manageable",
            submenu:
            [
                {role: "about"},
                {type: "separator"},
                {role: "quit"}
            ]
        }] : [])
];

module.exports.menu = Menu.buildFromTemplate(template);