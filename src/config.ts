/* eslint-disable @typescript-eslint/naming-convention */
import core from "@actions/core";

export const COMMIT_MSG = core.getInput("COMMIT_MSG") || "chore(readme): Update staff list";
