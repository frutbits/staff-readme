import { spawn } from "child_process";

export async function exec(cmd: string, args: string[] = []): Promise<number | null> {
    return new Promise((resolve, reject) => {
        const app = spawn(cmd, args, { stdio: "pipe" });
        let stdout = "";
        app.stdout.on("data", data => {
            stdout = data;
        });
        app.on("close", code => {
            if (code !== 0 && !stdout.includes("nothing to commit")) {
                const err = new Error(`Invalid status code when executing "${cmd}": ${code!}`);
                Object.assign(err, { code });
                return reject(err);
            }
            return resolve(code);
        });
        app.on("error", reject);
    });
}
