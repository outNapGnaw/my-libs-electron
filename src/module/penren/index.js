import robot from "robotjs";
import { clipboard, ipcMain, globalShortcut} from "electron";
import fs from "fs";
export const test = function () {
    // Speed up the mouse.
    robot.setMouseDelay(2);

    var twoPI = Math.PI * 2.0;
    var screenSize = robot.getScreenSize();
    var height = (screenSize.height / 2) - 10;
    var width = screenSize.width;
    var y;
    for (var x = 0; x < width; x++) {
        y = height * Math.sin((twoPI * x) / width) + height;
        robot.moveMouse(x, y);
    }

}
export const penren = function () {
    let isPening = false
    ipcMain.on('penren', (event, arg) => {
        let penrenInterval
        if (arg.active === 'start') {
            if (isPening) {
                return false;
            }
            isPening = true
            globalShortcut.register('-', () => {
                event.sender.send('penren-reply', true)
                let messageIdx = 0 
                penrenInterval = setInterval(function () {
                    clipboard.writeText(arg.messageArr[messageIdx]);
                    robot.keyTap("enter");
                    robot.keyTap("v", "command");
                    robot.keyTap("enter");
                    messageIdx++
                    //溢出矫正
                    messageIdx = messageIdx % arg.messageArr.length
                },arg.rate || 300)
            })
            globalShortcut.register('=', () => {
                clearInterval(penrenInterval);
            })
        }else{
            // 注销快捷键
            globalShortcut.unregister('-')
            // 注销快捷键
            globalShortcut.unregister('=')

            isPening = false
        }
        // event.sender.send('asynchronous-reply', 'pong')
    })
}