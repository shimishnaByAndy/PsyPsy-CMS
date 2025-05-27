const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'Darkone-React_v1.0/JS/src/components');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'darkone-components-docs.md');

// Check if react-analyzer-mcp exists
const reactAnalyzerMcpDir = path.join(PROJECT_ROOT, 'mcps/react-analyzer-mcp');
if (!fs.existsSync(reactAnalyzerMcpDir)) {
  console.error('react-analyzer-mcp not found. Please install it first.');
  process.exit(1);
}

// Find all React component files
function findReactFiles(dir) {
  const reactFiles = [];
  
  function scanDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && 
                (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        reactFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return reactFiles;
}

// Analyze a component file
function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    // Use node with the MCP server to analyze the component
    // This is a simplified approach - in a real implementation, you'd use the proper MCP interface
    console.log(`Analyzing ${relativePath}...`);
    
    // Extract component name from filename
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Basic component analysis
    let props = {};
    const propRegex = /(\w+)\s*:\s*(\w+)/g;
    let propMatch;
    
    while ((propMatch = propRegex.exec(content)) !== null) {
      props[propMatch[1]] = { type: propMatch[2] };
    }
    
    return {
      name: componentName,
      path: relativePath,
      content: content
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return {
      name: path.basename(filePath, path.extname(filePath)),
      path: path.relative(PROJECT_ROOT, filePath),
      error: error.message
    };
  }
}

// Generate documentation from analysis results
function generateDocumentation(results) {
  let markdown = '# Darkone-React_v1.0 JS Components Documentation\n\n';
  
  for (const result of results) {
    markdown += `## ${result.name}\n\n`;
    markdown += `**File path:** \`${result.path}\`\n\n`;
    
    if (result.error) {
      markdown += `**Error during analysis:** ${result.error}\n\n`;
    } else {
      markdown += '### Component Content\n\n';
      markdown += '```jsx\n';
      markdown += result.content;
      markdown += '\n```\n\n';
    }
    
    markdown += '---\n\n';
  }
  
  return markdown;
}

// Main function
function main() {
  console.log('Finding React component files...');
  const componentFiles = findReactFiles(COMPONENTS_DIR);
  console.log(`Found ${componentFiles.length} component files.`);
  
  console.log('Analyzing components...');
  const results = componentFiles.map(analyzeComponent);
  
  console.log('Generating documentation...');
  const documentation = generateDocumentation(results);
  
  console.log(`Writing documentation to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, documentation, 'utf8');
  
  console.log('Done!');
}

main(); 