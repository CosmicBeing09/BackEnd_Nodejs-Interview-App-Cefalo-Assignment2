const { spawn } = require('child_process');
const Runner = require('./Runner');

 
class JavaRunner extends Runner {
  defaultFile() {
    return this.defaultfile;
  }
 
  constructor() {
    super();
    this.defaultfile = 'Hello.java';
  }
 
  run(file, directory, filename, extension,input, callback) {
    if (extension.toLowerCase() !== '.java') {
      console.log(`${file} is not a java file.`);
    }
    this.compile(file, directory, filename,input, callback);
  }
 
  // compile java source file
  compile(file, directory, filename,input, callback) {
    // set working directory for child_process
    const options = { cwd: directory };
    // var compiler = spawn('javac', ['CodeJava.java']);
    const argsCompile = [];
    argsCompile[0] = file;
    const compiler = spawn('javac', argsCompile);
    compiler.stdout.on('data', (data) => {
      console.log(`compile-stdout: ${data}`);
    });
    compiler.stderr.on('data', (data) => {
      console.log(`compile-stderr: ${String(data)}`);
      callback('1','Compilation error: '+ String(data)); // 1, compile error
    });
    compiler.on('close', (data) => {
      if (data === 0) {
        this.execute(filename, options,input, callback);
      }
    });
  }
 
  // execute the compiled class file
  execute(filename, options,input, callback) {
    const argsRun = [];
    argsRun[0] = filename;
    const executor = spawn('java', argsRun, options);

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
      callback('2', 'Execution Error: '+ String(output)); // 2, execution failure
    });
    executor.on('close', (output) => {
      this.log('sb: '+ sb);
      callback('0', sb); //0, no error
      sb = '';
      this.log(`stdout: ${output}`);
    });
  }
 
  log(message) {
    console.log(message);
  }
}
 
module.exports = JavaRunner;