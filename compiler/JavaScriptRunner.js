const { spawn } = require('child_process');
const Runner = require('./Runner');
 
class JavaScriptRunner extends Runner {
  defaultFile() {
    return this.defaultfile;
  }
 
  constructor() {
    super();
    this.defaultfile = 'Hello.js';
  }
 
  run(file, directory, filename, extension, input, callback) {
    if (extension.toLowerCase() !== '.js') {
      console.log(`${file} is not a javascript file.`);
    }
    this.execute(file, directory, input, callback);
  }
 
  execute(file, directory, input, callback) {
    // set working directory for child_process
    const options = { cwd: directory };
    const argsRun = [];
    argsRun[0] = file;
    console.log(`options: ${options}`);
    console.log(`argsRun: ${argsRun}`);
 
    const executor = spawn('node', argsRun, options);

    if(input !== null){
      executor.stdin.write(input);
      executor.stdin.end();
      }
    var sb = '';

    executor.stdout.on('data', (output) => {
      console.log(String(output));
      sb = sb.concat(output);
      //callback('0', String(output)); // 0, no error
    });
    executor.stderr.on('data', (output) => {
      console.log(`stderr: ${String(output)}`);
      callback('2', 'Execution Error: '+ String(output)); // 2, execution failure
    });
    executor.on('close', (output) => {
      this.log(`stdout: ${output}`);
      callback('0', sb);
    });
  }
 
  log(message) {
    console.log(message);
  }
}
 
module.exports = JavaScriptRunner;