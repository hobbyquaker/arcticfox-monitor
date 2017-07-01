const electron =            require('electron');
const app =                 electron.app;
const Menu =                electron.Menu;
const ipc =                 electron.ipcMain;
const BrowserWindow =       electron.BrowserWindow;
const dialog =              electron.dialog;

const storage =             require('electron-json-storage');
const windowStateKeeper =   require('electron-window-state');
const isDev =               require('electron-is-dev');

const path =                require('path');
const url =                 require('url');
const fs =                  require('fs');
const async =               require('async');
const fox =                 require('arcticfox');

let mainWindow;
let menu;
let debug;
let callbacks = {};
let running;
let pc = 50;
let pollPause;
let retainPuffs;
let csvFile;

let pollPuffDatapoints;

let menuItemRetain;
let menuItemCsv;
let menuTemplate = [
    {

        label: 'Tools',
        submenu: [
            {
                role: 'export',
                label: 'Export csv',
                enabled: false,
                click() { exportCsv(); }
            }
        ]
    },
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Clear chart on every puff',
                type: 'checkbox',
                checked: true,
                click(menuItem) {
                    retainPuffs = !menuItem.checked;
                    storage.set('retain', retainPuffs);
                    ipcSend('retain', retainPuffs);
                }
            }
        ]
    }

];

if (process.platform === 'darwin') {
    menuTemplate.unshift({
        label: 'Arcticfox Monitor',
        submenu: [
            {
                role: 'about',
                label: 'About Arcticfox Monitor'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide',
                label: 'Hide Arcticfox Monitor'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit',
                label: 'Quit Arcticfox Monitor'
            }
        ]
    });
}

if (isDev) {
    debug = console.log;
} else {
    debug = function () {};
}

function createWindow () {

    let mainWindowState = windowStateKeeper({
        defaultWidth: 860,
        defaultHeight: 540
    });

    let devWindowState = {
        width: 1280,
        height: 540
    };

    let windowState = isDev ? devWindowState : mainWindowState;

    mainWindow = new BrowserWindow(windowState);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    if (isDev) mainWindow.webContents.openDevTools();

    menu = Menu.buildFromTemplate(menuTemplate);

    if (process.platform === 'darwin') {
        menuItemCsv =           menu.items[1].submenu.items[1];
        menuItemRetain =        menu.items[2].submenu.items[0];
    } else {
        menuItemCsv =           menu.items[0].submenu.items[1];
        menuItemRetain =        menu.items[1].submenu.items[0];
    }

    Menu.setApplicationMenu(menu);

    // let's go!
    setTimeout(() => {


        let pollInterval;

        fox.on('connect', () => {
            debug('connect');
            ipcSend('connect');
            pollInterval = setInterval(() => {
                fox.readMonitoringData((err, data) => {
                    console.log(err, data);
                    if (!err) {
                        ipcSend('data', data);
                    }
                });
            }, 40);

        });

        fox.on('close', () => {
            debug('close');
            ipcSend('close');
            clearInterval(pollInterval);
        });

        fox.on('error', (err) => {
            debug(err);
            clearInterval(pollInterval);
        });

        setTimeout(() => {
            fox.connect();
        }, 1000);

        storage.get('retain', (err, data) => {
            if (!err) {
                retainPuffs = data;
            }
            ipcSend('retain', retainPuffs);

            menuItemRetain.checked = !retainPuffs;
        });

        storage.get('datapoints', (err, data) => {
            if (!err && data && data.length) {
                pollPuffDatapoints = data;
                ipcSend('series', data);
            }
        });

    }, 1000);

    if (!isDev) mainWindowState.manage(mainWindow);

    mainWindow.on('closed', () => {
        mainWindow = null;
        app.quit();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});


function ipcSend(key, data) {
    if (mainWindow) {
        mainWindow.webContents.send(key, data);
    } else {
        //if (port) port.close();
        app.quit();
    }
}

ipc.on('fire', (e, val) => {
    debug('fire', val);
    fox.makePuff(val);
});

ipc.on('cmd', (event, data) => {

});

ipc.on('datapoints', (e, val) => {
    storage.set('datapoints', val);
    pollPuffDatapoints = val;
});

ipc.on('csvdata', function (event, data) {
    debug('received export data', data.length);
    let lines = [['time']];
    let columns = {};
    let i = 1;
    Object.keys(data[Object.keys(data)[0]]).forEach(dp => {
        lines[0].push(dp);
        columns[dp] = i++;
    });
    Object.keys(data).sort().forEach(ts => {
        let line = [ts];
        Object.keys(data[ts]).forEach(dp => {
            if (!columns[dp]) {
                columns[dp] = i++;
                lines[0].push(dp);
            }
            line[columns[dp]] = data[ts][dp];
        });
        lines.push(line);
    });
    lines.forEach((line, index) => {
        lines[index] = line.join(';');
    });
    let csv = lines.join('\r\n');
    debug('write', csvFile);
    fs.writeFile(csvFile, csv);
});

function pollPuff() {
    if (pollPause) return;

    //ipcSend('values', obj);
}


function exportCsv() {
    dialog.showSaveDialog(mainWindow, {
        title: 'Export csv',
        filters: [
            {name: 'Comma seperated values', extensions: ['csv']}
        ]
    }, function (filename) {
        debug('export', filename);
        if (filename) {
            csvFile = filename;
            ipcSend('csv');
        }
    });
}

