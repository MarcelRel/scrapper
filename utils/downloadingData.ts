import {exec} from "child_process";
import {parseCSVAndSaveToDB} from "../index";
//(path: string, csvPath: string)
export const runSeleniumTest = (path: string, csvPath: string) => {
    const command = `selenium-side-runner -c "browserName=chrome goog:chromeOptions.args=[headless=new]" ${path}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            exec('npm update chromedriver', (e) => {
                console.error('exec response with an error', e);
                setTimeout(() => {
                    runSeleniumTest(path, csvPath)
                }, 10000);

            })
        } else {
        }
        console.log('stdout:', stdout);
        console.error('stderr', stderr);
        parseCSVAndSaveToDB(csvPath);
    });
};
