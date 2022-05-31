<div align="center">

<img src="https://api.zhycorp.org/assets/images/logo.webp" alt="Zhycorp Logo" width="200px" height="200px"/>

# @zhycorp/staff-readme

**A reuseable GitHub workflows for updating Zhycorp staff list continuously**

[![GitHub](https://img.shields.io/github/license/zhycorp/staff-readme)](https://github.com/zhycorp/staff-readme/blob/main/LICENSE)
[![GitHub version](https://badge.fury.io/gh/zhycorp%2Fstaff-readme.svg)](https://badge.fury.io/gh/zhycorp%2Fstaff-readme)
[![Discord](https://discordapp.com/api/guilds/332877090003091456/embed.png)](https://zhycorp.org/discord)

</div>


# Usage
This will update your README file every 30 minutes:
```yml
name: Update README staff list

on:
  schedule:
    - cron: '*/30 * * * *'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    name: Update this repo's README with latest staff list from Zhycorp

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3.0.2

      - name: Update README
        env:
          WORKING_DIRECTORY: ./path/to/readme/folder # README usually located at root-level, so it's should be `.`
        uses: zhycorp/staff-readme@version # Change this with latest version
```
Add following code to your README:
```md
<!--START_SECTION:administrator_list-->
<!--END_SECTION:administrator_list-->
```