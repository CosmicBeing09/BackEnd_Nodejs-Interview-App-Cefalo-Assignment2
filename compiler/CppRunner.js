const { spawn } = require('child_process');
const Runner = require('./Runner');
const path = require('path');
 
class CppRunner extends Runner {
  defaultFile() {
    return this.defaultfile;
  }
 
  constructor() {
    super();
    this.defaultfile = 'Hello.cpp';
  }
 
  run(file, directory, filename, extension,input, callback) {
    if (extension.toLowerCase() !== '.cpp') {
      console.log(`${file} is not a cpp file.`);
      return;
    }
    this.compile(file, directory, filename,input, callback);
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
 
    // const compile = spawn('g++', ['Hello.cpp', '-o','Hello.out']);
    const compiler = spawn('g++', argsCompile);
    compiler.stdout.on('data', (data) => {
      console.log(`compile-stdout: ${data}`);
    });
    compiler.stderr.on('data', (data) => {
      console.log(`compile-stderr: ${String(data)}`);
      callback('1','Compilation error: '+ String(data));  // 1, compile error
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
 
    // const executor = spawn('./Hello.out', [], options);
    const executor = spawn(cmdRun, [], options);

    if(input !== null){
      executor.stdin.write(input);
      executor.stdin.end();
      }
    var sb = '';

    executor.stdout.on('data', (output) => {
      console.log('output: '+ String(output));
      sb = sb.concat(output);
     // callback('0', String(output)); // 0, no error
    });
    executor.stderr.on('data', (output) => {
      console.log(`stderr: ${String(output)}`);
      callback('2', 'Execution Error: '+ String(output)); // 2, execution failure
    });
    executor.on('close', (output) => {
      this.log(`stdout close : ${output}`);
      callback('0', sb); //0, no error
    });
  }
 
  log(message) {
    console.log(message);
  }
}
 
module.exports = CppRunner;