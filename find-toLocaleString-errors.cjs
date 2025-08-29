const fs = require('fs');
const path = require('path');

function findToLocaleStringCalls(dir) {
  const results = [];
  
  function scanDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.includes('toLocaleString()')) {
              results.push({
                file: filePath,
                line: index + 1,
                content: line.trim(),
                hasNullCheck: line.includes('||') || line.includes('?.') || line.includes('|| 0')
              });
            }
          });
        } catch (error) {
          console.log(`Error reading file ${filePath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return results;
}

function analyzeToLocaleStringUsage() {
  console.log('🔍 Finding all toLocaleString() calls in the codebase...\n');
  
  const calls = findToLocaleStringCalls('.');
  
  console.log(`Found ${calls.length} toLocaleString() calls:\n`);
  
  const problematicCalls = [];
  const safeCalls = [];
  
  calls.forEach(call => {
    if (call.hasNullCheck) {
      safeCalls.push(call);
    } else {
      problematicCalls.push(call);
    }
  });
  
  console.log(`⚠️  POTENTIALLY PROBLEMATIC CALLS (${problematicCalls.length}):`);
  console.log('=====================================');
  problematicCalls.forEach(call => {
    console.log(`\n📁 File: ${call.file}`);
    console.log(`📄 Line: ${call.line}`);
    console.log(`🔍 Content: ${call.content}`);
  });
  
  console.log(`\n✅ SAFE CALLS (${safeCalls.length}):`);
  console.log('=====================================');
  safeCalls.forEach(call => {
    console.log(`\n📁 File: ${call.file}`);
    console.log(`📄 Line: ${call.line}`);
    console.log(`🔍 Content: ${call.content}`);
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`- Total calls: ${calls.length}`);
  console.log(`- Safe calls: ${safeCalls.length}`);
  console.log(`- Potentially problematic: ${problematicCalls.length}`);
  
  if (problematicCalls.length > 0) {
    console.log(`\n🚨 RECOMMENDATION: Fix the ${problematicCalls.length} potentially problematic calls above`);
  }
}

analyzeToLocaleStringUsage(); 