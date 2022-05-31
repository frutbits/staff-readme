import { exec } from "./exec";

export async function commitFile(): Promise<any> {
    await exec("git", [
        "config",
        "--global",
        "user.email",
        "github-actions[bot]@users.noreply.github.com"
    ]);
    await exec("git", ["config", "--global", "user.name", "github-actions[bot]"]);
    await exec("git", ["add", "README.md"]);
    await exec("git", ["commit", "-m", "chore(readme): Update staff list"]);
    await exec("git", ["push"]);
}
