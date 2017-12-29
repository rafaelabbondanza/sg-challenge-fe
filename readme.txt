Installation:
  - Make sure node (v8.1.*), npm (v5.*), gulp (v3.9.*), and bower (v1.8.*) are installed globally on your machine
  - run 'npm install' from this directory
  - run 'bower install' from this directory

Local development:
  - To watch files locally, run 'gulp watch-dev'
  - Please note: there is a known bug with this task. If there's a mistake in any sass file, the local server will crash. Re-run in twice to get it back up.

SP deployment:
  - 'gulp build-full' will build a folder './dist.sp' at the root of the project
  - Upload the whole './dist.sp/Dist' directory to SP in the /sites/PAR/MetLifeCustom/Forms/AllItems.aspx directory.

