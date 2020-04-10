const { spawn } = require('child_process');
const Runner = require('./Runner');
const path = require('path');
 
class CRunner extends Runner {
  defaultFile() {
    return this.defaultfile;
  }
 
  constructor() {
    super();
    this.defaultfile = 'Hello.c';
  }
 
  run(file, directory, filename, extension, input, callback) {
    if (extension.toLowerCase() !== '.c') {
      console.log(`${file} is not a c file.`);
      return;
    }
    this.compile(file, directory, filename, input, callback);
  }
 
  // compile a c file
  compile(file, directory, filename, input, callback) {
    
    // set working directory for child_process
    const options = { cwd: directory };
    // ['codec.c', '-o','codec.out']
    const argsCompile = [];
    argsCompile[0] = file;
    argsCompile[1] = '-o';
    argsCompile[2] = path.join(directory, `${filename}.out`);
    console.log(`argsCompile:${argsCompile}`);
 
    // const compile = spawn('gcc', ['codec.c', '-o','codec.out']);
    const compiler = spawn('gcc', argsCompile);
    compiler.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    compiler.stderr.on('data', (data) => {
      console.log(`compile-stderr: ${String(data)}`);
      callback('1', String(data)); // 1, compile error
    });
    compiler.on('close', (data) => {
      if (data === 0) {
        this.execute(directory, filename, options, input, callback);
      }
    });
  }
 
  // execute the compiled file
  execute(directory, filename, options, input, callback) {
    const cmdRun = path.join(directory, `${filename}.out`);
  
    console.log(input);
    
    // const executor = spawn('./Hello.out', [], options);
    const executor = spawn(cmdRun, [], options);

    if(input !== null){
    executor.stdin.write(input);
    executor.stdin.end();
    }

    var sb = '';

    executor.stdout.on('data', (output) => {
     // console.log(String(output));
      sb = sb.concat(output);
      //callback('0', String(output)); // 0, no error
    });
    
    executor.stderr.on('data', (output) => {
      console.log(`stderr: ${String(output)}`);
      callback('2', String(output)); // 2, execution failure
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
 
module.exports = CRunner;