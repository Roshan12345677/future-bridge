/**
 * Compiler Controller - JDoodle API
 * Free: 200 executions/day
 * https://www.jdoodle.com/compiler-api
 */

const { asyncHandler, AppError } = require('../middleware/error');

const LANGUAGE_MAP = {
  cpp:        { language: 'cpp17',         versionIndex: '0' },
  c:          { language: 'c',             versionIndex: '5' },
  java:       { language: 'java',          versionIndex: '4' },
  python:     { language: 'python3',       versionIndex: '4' },
  javascript: { language: 'nodejs',        versionIndex: '4' },
  typescript: { language: 'typescript',    versionIndex: '0' },
  go:         { language: 'go',            versionIndex: '4' },
  rust:       { language: 'rust',          versionIndex: '4' },
};

const CODE_TEMPLATES = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Future Bridge!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Future Bridge!");
    }
}`,
  python: `def main():
    print("Hello, Future Bridge!")

if __name__ == "__main__":
    main()`,
  javascript: `function main() {
    console.log("Hello, Future Bridge!");
}

main();`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, Future Bridge!\\n");
    return 0;
}`,
};

/**
 * @desc    Execute code via JDoodle API
 * @route   POST /api/compiler/execute
 * @access  Private
 */
const executeCode = asyncHandler(async (req, res, next) => {
  const { code, language, input = '' } = req.body;

  if (!code || !language) {
    return next(new AppError('Code and language are required', 400));
  }

  const langConfig = LANGUAGE_MAP[language.toLowerCase()];
  if (!langConfig) {
    return next(new AppError(`Language '${language}' is not supported`, 400));
  }

  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  // Demo mode if no API credentials
  if (!clientId || !clientSecret ||
      clientId === 'your_client_id' ||
      clientSecret === 'your_client_secret') {
    console.log('⚠️  JDoodle credentials not set - using demo mode');
    return res.json({
      success: true,
      result: {
        stdout: simulateExecution(code, language),
        stderr: null,
        compile_output: null,
        status: { id: 3, description: 'Accepted' },
        time: '0.1',
        memory: 1024,
        isDemo: true,
        message: 'Demo mode — add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to .env for real execution',
      },
    });
  }

  try {
    console.log(`🔧 Executing ${language} code via JDoodle API...`);

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        stdin: input,
      }),
    });

    const data = await response.json();
    console.log('JDoodle response:', JSON.stringify(data));

    if (data.error || data.statusCode === 429) {
      throw new Error(data.error || 'Daily limit exceeded');
    }

    console.log('✅ JDoodle executed successfully');

    // JDoodle returns output field directly
    const isSuccess = data.isExecutionSuccess === true;
    const output = data.output || '';
    const hasRuntimeError = !isSuccess ||
                            output.toLowerCase().includes('error in') ||
                            output.toLowerCase().includes('exception in') ||
                            output.toLowerCase().includes('traceback');

    const result = {
      stdout: hasRuntimeError ? null : output,
      stderr: hasRuntimeError ? output : null,
      compile_output: data.compilationStatus || null,
      status: {
        id: hasRuntimeError ? 11 : 3,
        description: hasRuntimeError ? 'Runtime Error' : 'Accepted',
      },
      time: data.cpuTime || '0.05',
      memory: parseInt(data.memory) || 1024,
    };

    res.json({ success: true, result });

  } catch (error) {
    console.error('❌ JDoodle error:', error.message);
    res.json({
      success: true,
      result: {
        stdout: null,
        stderr: `Execution failed: ${error.message}`,
        status: { id: 11, description: 'Error' },
        time: '0',
        memory: 0,
        isDemo: true,
      },
    });
  }
});

/**
 * @desc    Get code templates
 * @route   GET /api/compiler/templates
 * @access  Private
 */
const getTemplates = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    templates: CODE_TEMPLATES,
    languages: Object.keys(LANGUAGE_MAP),
  });
});

// Simple simulation for demo mode
const simulateExecution = (code, language) => {
  if (language === 'python') {
    const lines = code.split('\n');
    const outputs = [];
    lines.forEach(line => {
      const match = line.match(/print\((.+)\)/);
      if (match) {
        try {
          const content = match[1].replace(/['"]/g, '');
          outputs.push(content);
        } catch (e) {}
      }
    });
    if (outputs.length > 0) return outputs.join('\n');
  }
  if (language === 'javascript') {
    const lines = code.split('\n');
    const outputs = [];
    lines.forEach(line => {
      const match = line.match(/console\.log\((.+)\)/);
      if (match) {
        try {
          const content = match[1].replace(/['"]/g, '');
          outputs.push(content);
        } catch (e) {}
      }
    });
    if (outputs.length > 0) return outputs.join('\n');
  }
  return '[Demo Mode] Code received. Add JDoodle credentials to .env for real execution.';
};

module.exports = { executeCode, getTemplates };