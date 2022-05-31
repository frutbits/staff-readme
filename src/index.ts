import { Toolkit } from "actions-toolkit";
import { readFileSync, writeFileSync } from "fs";
import { request } from "undici";
import { APIResponse } from "./typings";
import { commitFile } from "./utils/commitFile";
import { parseTable } from "./utils/parseTable";

const startComment = "<!--START_SECTION:administrator_list-->";
const endComment = "<!--END_SECTION:administrator_list-->";

Toolkit.run(async tools => {
    const workingDirectory = process.env.WORKING_DIRECTORY ?? ".";
    tools.log.debug("GET /membership");
    const response = await request("https://api.zhycorp.org/membership").catch((e: Error) => e);
    if (response instanceof Error) {
        return tools.exit.failure(`Couldn't GET /membership: ${response.message}`);
    }
    if (response.statusCode !== 200) {
        return tools.exit.failure(`Received non-200 response code: ${response.statusCode}`);
    }
    let data: APIResponse;
    try {
        data = await response.body.json() as APIResponse;
    } catch {
        return tools.exit.failure("Failed to parse membership data");
    }
    tools.log.debug(`Found ${data.administrator.length} administrator`);
    if (data.administrator.length === 0) {
        return tools.exit.failure("Administrator is empty, aborting process");
    }

    const readmeContent = readFileSync(`${workingDirectory}/README.md`, "utf-8").split("\n");
    let startIndex = readmeContent.findIndex(c => c.trim() === startComment);
    if (startIndex === -1) {
        return tools.exit.failure(`Couldn't find the "${startComment}" comment`);
    }

    const endIndex = readmeContent.findIndex(c => c.trim() === endComment);
    if (endIndex === -1) {
        return tools.exit.failure(`Couldn't find the "${endComment}" comment`);
    }

    const content = parseTable(data.administrator)
        .map(x => `<tr>${x.join("\n")}</tr>`);
    content.unshift("<table>");
    content.push("</table>");

    if (startIndex !== -1 && endIndex === -1) {
        startIndex++;
        content.forEach((line, i) => readmeContent.splice(startIndex + i, 0, line));
        readmeContent.splice(
            startIndex + content.length,
            0,
            "<!--END_SECTION:administrator_list>"
        );

        writeFileSync(`${workingDirectory}/README.md`, readmeContent.join("\n"));
        try {
            await commitFile();
        } catch (err) {
            tools.log.debug("Something went wrong");
            return tools.exit.failure(err as string);
        }
        return tools.exit.success("Updated README");
    }

    const oldContent = readmeContent.slice(startIndex + 1, endIndex).join("\n");
    const newContent = content.join("\n");

    if (oldContent.trim() === newContent.trim()) {
        return tools.exit.success("No changes detected");
    }

    startIndex++;
    const staffSection = readmeContent.slice(startIndex, endIndex);
    if (staffSection.length) {
        let count = 0;
        staffSection.some((line, idx) => {
            if (!content[count]) {
                return true;
            }
            if (line !== "") {
                readmeContent[startIndex + idx] = content[count];
                count++;
            }
        });
        tools.log.success("Overwrited readme");
    } else {
        content.some((line, index) => {
            if (!line) return true;
            readmeContent.splice(startIndex + index, 0, line);
        });
        tools.log.success("Updated README");
    }
    writeFileSync(`${workingDirectory}/README.md`, readmeContent.join("\n"));
    try {
        await commitFile();
    } catch (err) {
        tools.log.debug("Something went wrong");
        return tools.exit.failure(err as string);
    }
    tools.exit.success("Pushed to remote repository");
}, {
    event: ["schedule", "workflow_dispatch"]
}).catch(e => console.error(e));
