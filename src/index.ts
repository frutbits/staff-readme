import { Toolkit } from "actions-toolkit";
import { readFileSync, writeFileSync } from "fs";
import { request } from "undici";
import { APIResponse } from "./typings";
import { commitFile } from "./utils/commitFile";
import { parseTable } from "./utils/parseTable";

const startComment = "<!--START_SECTION:administrator_list-->";
const endComment = "<!--END_SECTION:administrator_list-->";

Toolkit.run(async tools => {
    // Define root directory
    const workingDirectory = process.env.WORKING_DIRECTORY ?? ".";
    // Fetch data from /membership
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
        data = await response.body.json();
    } catch {
        return tools.exit.failure("Failed to parse membership data");
    }

    tools.log.debug(`Found ${data.administrator.length} administrator`);

    if (data.administrator.length === 0) {
        return tools.exit.success("Administrator is empty, aborting update");
    }

    let readmeContent = readFileSync(`${workingDirectory}/README.md`, "utf-8").split("\n");

    // Look for staff list section
    const startIndex = readmeContent.findIndex(c => c.trim() === startComment);
    if (startIndex === -1) {
        return tools.exit.failure(`Couldn't find the "${startComment}" comment`);
    }

    let endIndex = readmeContent.findIndex(c => c.trim() === endComment);
    if (endIndex === -1) {
        return tools.exit.failure(`Couldn't find the "${endComment}" comment`);
    }

    const content = ["<table>", ...parseTable(data.administrator)
        .map(x => `<tr>${x.join("")}</tr>`), "</table>"];

    const existingData = readmeContent.slice(startIndex + 1, endIndex);
    readmeContent = readmeContent.filter(x => !existingData.includes(x));
    endIndex = readmeContent.findIndex(c => c.trim() === endComment);

    const matched = existingData.map(x => content.find(y => x === y) !== undefined);
    // Need to be updated
    if (matched.some(x => !x)) {
        tools.log.info("Found diff data. Updating..");
        readmeContent.splice(startIndex + 1, 0, ...content);
        writeFileSync(`${workingDirectory}/README.md`, readmeContent.join("\n"));
        try {
            await commitFile();
        } catch (err) {
            tools.log.debug("Something went wrong");
            return tools.exit.failure(err as string);
        }
        tools.exit.success("Pushed to remote repository");
    }
    tools.exit.success("Up-to-date already");
}, {
    event: ["schedule", "workflow_dispatch"]
}).catch(e => console.error(e));
