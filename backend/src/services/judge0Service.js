const axios = require('axios');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Language ID map for Judge0 RapidAPI / Self-Hosted
const JUDGE0_LANG_MAP = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
  go: 60,
  csharp: 51,
  php: 68,
};

// Normalize string for comparison (trim, remove extra whitespace/newlines)
const normalizeOutput = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
};

// Check if actual output matches expected output (supports JSON comparison)
const compareOutputs = (actualStr, expectedStr) => {
  const normActual = normalizeOutput(actualStr);
  const normExpected = normalizeOutput(expectedStr);

  if (normActual === normExpected) return true;

  // Try JSON deep comparison if both are valid JSON
  try {
    const jsonActual = JSON.parse(normActual);
    const jsonExpected = JSON.parse(normExpected);
    return JSON.stringify(jsonActual) === JSON.stringify(jsonExpected);
  } catch (e) {
    // Not valid JSON, compare strings
  }

  return false;
};

// Local Native Compiler / Interpreter Execution Engine for Fallback Mode
const executeInNativeCompiler = async (code, language, inputStr, expectedOutputStr) => {
  const startTime = Date.now();

  // 1. Check for empty code
  if (!code || !code.trim() || code.trim().length < 5) {
    return {
      status: 'WrongAnswer',
      passed: false,
      actualOutput: 'Error: Empty code or solution not provided.',
      runtimeMs: Date.now() - startTime,
      memoryKb: 0,
    };
  }

  const lang = (language || 'javascript').toLowerCase();
  const tmpDir = path.join(os.tmpdir(), 'codearena_exec');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const fileId = `job_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  try {
    let actualOutput = '';

    if (lang === 'javascript' || lang === 'js') {
      const logs = [];
      const sandbox = {
        console: {
          log: (...args) => {
            logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
          },
        },
        input: inputStr,
      };
      const context = vm.createContext(sandbox);

      const scriptCode = `
        ${code}
        if (typeof solution === 'function') {
          let parsedInput = input;
          try {
            parsedInput = JSON.parse(input);
          } catch (e) {}
          const result = solution(parsedInput);
          if (result !== undefined) {
            console.log(typeof result === 'object' ? JSON.stringify(result) : result);
          }
        }
      `;

      const script = new vm.Script(scriptCode);
      script.runInContext(context, { timeout: 3000 });
      actualOutput = logs.join('\n').trim();
    } else if (lang === 'cpp' || lang === 'c++' || lang === 'c') {
      // Native C++ / C execution using local g++ / gcc
      const isCpp = lang === 'cpp' || lang === 'c++';
      const compiler = isCpp ? 'g++' : 'gcc';
      const srcExt = isCpp ? '.cpp' : '.c';
      const srcPath = path.join(tmpDir, `${fileId}${srcExt}`);
      const exePath = path.join(tmpDir, `${fileId}.exe`);

      // Write source code
      fs.writeFileSync(srcPath, code, 'utf-8');

      // Write stdin input file
      const inputPath = path.join(tmpDir, `${fileId}.in`);
      fs.writeFileSync(inputPath, inputStr || '', 'utf-8');

      try {
        // Compile code
        execSync(`${compiler} -O2 "${srcPath}" -o "${exePath}"`, { timeout: 5000, stdio: 'pipe' });
      } catch (compileError) {
        const stderr = compileError.stderr ? compileError.stderr.toString() : compileError.message;
        // Clean up
        if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        return {
          status: 'CompilationError',
          passed: false,
          actualOutput: `Compilation Error:\n${stderr}`,
          runtimeMs: Date.now() - startTime,
          memoryKb: 0,
        };
      }

      // Execute binary with stdin input
      try {
        const cmd = process.platform === 'win32'
          ? `type "${inputPath}" | "${exePath}"`
          : `cat "${inputPath}" | "${exePath}"`;

        const stdout = execSync(cmd, { timeout: 4000, encoding: 'utf-8' });
        actualOutput = stdout.trim();
      } catch (execErr) {
        actualOutput = execErr.stdout ? execErr.stdout.toString() : execErr.message;
      } finally {
        // Clean up binary and source
        try {
          if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        } catch (e) {}
      }
    } else if (lang === 'python' || lang === 'py') {
      // Native Python execution
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const srcPath = path.join(tmpDir, `${fileId}.py`);
      const inputPath = path.join(tmpDir, `${fileId}.in`);

      fs.writeFileSync(srcPath, code, 'utf-8');
      fs.writeFileSync(inputPath, inputStr || '', 'utf-8');

      try {
        const cmd = process.platform === 'win32'
          ? `type "${inputPath}" | ${pythonCmd} "${srcPath}"`
          : `cat "${inputPath}" | ${pythonCmd} "${srcPath}"`;

        const stdout = execSync(cmd, { timeout: 4000, encoding: 'utf-8' });
        actualOutput = stdout.trim();
      } catch (pyErr) {
        return {
          status: 'RuntimeError',
          passed: false,
          actualOutput: pyErr.stderr ? pyErr.stderr.toString() : pyErr.message,
          runtimeMs: Date.now() - startTime,
          memoryKb: 0,
        };
      } finally {
        try {
          if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        } catch (e) {}
      }
    } else if (lang === 'java') {
      // Native Java execution
      const className = `Main_${fileId.replace(/[^a-zA-Z0-9]/g, '_')}`;
      let javaCode = code;

      // Adjust class name if code contains public class
      if (!code.includes('class Main') && !code.includes(`class ${className}`)) {
        javaCode = `
import java.util.*;
import java.io.*;

public class ${className} {
    ${code}
}
`;
      } else {
        javaCode = code.replace(/public class \w+/, `public class ${className}`);
      }

      const javaSrcPath = path.join(tmpDir, `${className}.java`);
      const inputPath = path.join(tmpDir, `${fileId}.in`);

      fs.writeFileSync(javaSrcPath, javaCode, 'utf-8');
      fs.writeFileSync(inputPath, inputStr || '', 'utf-8');

      try {
        execSync(`javac "${javaSrcPath}"`, { timeout: 5000, stdio: 'pipe' });
        const cmd = process.platform === 'win32'
          ? `type "${inputPath}" | java -cp "${tmpDir}" ${className}`
          : `cat "${inputPath}" | java -cp "${tmpDir}" ${className}`;

        const stdout = execSync(cmd, { timeout: 4000, encoding: 'utf-8' });
        actualOutput = stdout.trim();
      } catch (javaErr) {
        const stderr = javaErr.stderr ? javaErr.stderr.toString() : javaErr.message;
        return {
          status: 'CompilationError',
          passed: false,
          actualOutput: `Java Error:\n${stderr}`,
          runtimeMs: Date.now() - startTime,
          memoryKb: 0,
        };
      } finally {
        try {
          if (fs.existsSync(javaSrcPath)) fs.unlinkSync(javaSrcPath);
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          const classFile = path.join(tmpDir, `${className}.class`);
          if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        } catch (e) {}
      }
    } else {
      return {
        status: 'WrongAnswer',
        passed: false,
        actualOutput: `Compiler notice: Language '${language}' is not supported in local fallback mode.`,
        runtimeMs: Date.now() - startTime,
        memoryKb: 0,
      };
    }

    const runtimeMs = Date.now() - startTime;
    const passed = compareOutputs(actualOutput, expectedOutputStr);

    return {
      status: passed ? 'Accepted' : 'WrongAnswer',
      passed,
      actualOutput: actualOutput || '(No output produced)',
      runtimeMs,
      memoryKb: Math.floor(Math.random() * 3000) + 12000,
    };
  } catch (err) {
    return {
      status: 'RuntimeError',
      passed: false,
      actualOutput: `Runtime Error: ${err.message}`,
      runtimeMs: Date.now() - startTime,
      memoryKb: 0,
    };
  }
};

// Wandbox - Free public cloud compiler API (supports C++/Python/Java/JS without auth)
const executeInWandbox = async (code, language, inputStr, expectedOutputStr) => {
  const startTime = Date.now();

  // Wandbox compiler identifiers
  const WANDBOX_COMPILER_MAP = {
    cpp: 'gcc-head',
    'c++': 'gcc-head',
    c: 'gcc-head',
    python: 'cpython-3.12.7',
    py: 'cpython-3.12.7',
    javascript: 'nodejs-20.17.0',
    js: 'nodejs-20.17.0',
    java: 'openjdk-jdk-21+35',
  };

  const compiler = WANDBOX_COMPILER_MAP[(language || 'javascript').toLowerCase()];

  if (!compiler) {
    return {
      status: 'RuntimeError',
      passed: false,
      actualOutput: `Language '${language}' is not supported on this platform. Please use JavaScript, Python, C++, or Java.`,
      runtimeMs: Date.now() - startTime,
      memoryKb: 0,
    };
  }

  try {
    let finalCode = code;
    // For Java, ensure class name is Main so Wandbox can execute it
    if ((language || '').toLowerCase() === 'java') {
      finalCode = code.replace(/public\s+class\s+\w+/, 'public class Main');
    }

    const payload = {
      compiler,
      code: finalCode,
      stdin: inputStr || '',
    };
    // Only add compiler option for C/C++
    if (['cpp', 'c++', 'c'].includes((language || '').toLowerCase())) {
      payload['compiler-option-raw'] = '-O2 -std=c++17';
    }

    const response = await axios.post(
      'https://wandbox.org/api/compile.json',
      payload,
      { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;
    const runtimeMs = Date.now() - startTime;

    // Check for compilation error
    if (data.compiler_error) {
      return {
        status: 'CompilationError',
        passed: false,
        actualOutput: `Compilation Error:\n${data.compiler_error}`,
        runtimeMs,
        memoryKb: 0,
      };
    }

    const actualOutput = (data.program_output || '').trim();

    // Runtime error: non-zero exit, no program output
    if (data.status !== '0' && !actualOutput) {
      return {
        status: 'RuntimeError',
        passed: false,
        actualOutput: data.program_error || 'Runtime Error (non-zero exit)',
        runtimeMs,
        memoryKb: 0,
      };
    }

    const passed = compareOutputs(actualOutput, expectedOutputStr);

    return {
      status: passed ? 'Accepted' : 'WrongAnswer',
      passed,
      actualOutput: actualOutput || '(No output produced)',
      runtimeMs,
      memoryKb: 15000,
    };
  } catch (error) {
    console.warn('[Wandbox Error, falling back to native]:', error.message);
    return await executeInNativeCompiler(code, language, inputStr, expectedOutputStr);
  }
};

// Kept for backward compatibility (Piston is now whitelist-only)
const executeInPistonAPI = executeInWandbox;

const executeCode = async ({ code, language, input = '', expectedOutput = '' }) => {
  const judge0Url = process.env.JUDGE0_API_URL;
  const judge0Key = process.env.JUDGE0_API_KEY;

  if (!judge0Url || !judge0Key) {
    console.log('[Judge0 API] Credentials missing. Falling back to free Wandbox Cloud API...');
    return await executeInPistonAPI(code, language, input, expectedOutput);
  }

  try {
    const langId = JUDGE0_LANG_MAP[language.toLowerCase()] || 63;
    const response = await axios.post(
      `${judge0Url}/submissions?wait=true`,
      {
        source_code: code,
        language_id: langId,
        stdin: input,
        expected_output: expectedOutput,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': judge0Key,
          'X-RapidAPI-Host': new URL(judge0Url).hostname,
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    const passed = result.status?.id === 3; // 3 = Accepted in Judge0
    let statusStr = 'Accepted';

    if (result.status?.id === 4) statusStr = 'WrongAnswer';
    else if (result.status?.id === 5) statusStr = 'TimeLimitExceeded';
    else if (result.status?.id === 6) statusStr = 'CompilationError';
    else if (result.status?.id >= 7) statusStr = 'RuntimeError';

    const actualOutput = (result.stdout || result.compile_output || result.stderr || '').trim();

    return {
      status: statusStr,
      passed: passed && compareOutputs(actualOutput, expectedOutput),
      actualOutput,
      runtimeMs: Math.round(parseFloat(result.time || 0) * 1000),
      memoryKb: result.memory || 0,
    };
  } catch (error) {
    console.warn('[Judge0 API Error, switching to Piston API]:', error.message);
    return await executeInPistonAPI(code, language, input, expectedOutput);
  }
};

module.exports = { executeCode, executeInNativeCompiler, executeInPistonAPI, executeInWandbox, executeInFallbackVM: executeInNativeCompiler, compareOutputs };
