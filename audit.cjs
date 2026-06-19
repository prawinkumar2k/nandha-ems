const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

function walkDir(dir, filterExt = '.jsx') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath, filterExt));
    } else if (filePath.endsWith(filterExt)) {
      results.push(filePath);
    }
  });
  return results;
}

// Extract all frontend API calls
const pages = walkDir(clientDir, '.jsx');
const frontendCalls = [];

pages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const regex = /(apiClient|axios|fetch)\.(get|post|put|delete|patch)\(\s*[`'"](.*?)[`'"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let endpoint = match[3];
    // Strip query params and variables
    endpoint = endpoint.split('?')[0];
    endpoint = endpoint.replace(/\$\{[^}]+\}/g, '*');
    frontendCalls.push({
      file: page.replace(rootDir, ''),
      method: match[2].toLowerCase(),
      endpoint: endpoint
    });
  }
});

// Extract all backend routes
const backendRoutes = [];
const indexContent = fs.readFileSync(path.join(serverDir, 'index.js'), 'utf8');
const appRouteRegex = /app\.(get|post|put|delete|patch)\(\s*[`'"](.*?)[`'"]/g;
let m;
while ((m = appRouteRegex.exec(indexContent)) !== null) {
  backendRoutes.push({ method: m[1].toLowerCase(), endpoint: m[2] });
}

const routerUseRegex = /app\.use\(\s*[`'"](.*?)[`'"],\s*(\w+)/g;
let useMatch;
const routerMappings = {};
while ((useMatch = routerUseRegex.exec(indexContent)) !== null) {
  routerMappings[useMatch[2]] = useMatch[1];
}

const routeFiles = walkDir(path.join(serverDir, 'routes'), '.js');
routeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const routerRouteRegex = /router\.(get|post|put|delete|patch)\(\s*[`'"](.*?)[`'"]/g;
  let rm;
  
  const fileName = path.basename(file, '.js');
  let prefix = '';
  Object.keys(routerMappings).forEach(key => {
    if (key.toLowerCase().includes(fileName.toLowerCase())) {
      prefix = routerMappings[key];
    }
  });
  if (!prefix && fileName === 'devices') prefix = '/api/devices';
  if (!prefix && fileName === 'lab') prefix = '/api/labs';
  if (!prefix && fileName === 'securityEvents') prefix = '/api/security-events';

  while ((rm = routerRouteRegex.exec(content)) !== null) {
    let routePath = rm[2];
    if (routePath === '/') routePath = '';
    backendRoutes.push({
      method: rm[1].toLowerCase(),
      endpoint: prefix + routePath
    });
  }
});

// Normalize backend routes for comparison
backendRoutes.forEach(r => {
  r.pattern = r.endpoint.replace(/:[^\/]+/g, '*');
});

// Verification
const fails = [];

function matchRoute(method, endpoint) {
  return backendRoutes.some(br => {
    if (br.method !== method) return false;
    // Replace * with regex wildcard
    let regexStr = '^' + br.pattern.replace(/\*/g, '([^/]+)') + '$';
    // Allow trailing slash mismatch
    regexStr = regexStr.replace(/\/+\$$/, '/?$');
    const regex = new RegExp(regexStr);
    return regex.test(endpoint);
  });
}

frontendCalls.forEach(call => {
  if (!call.endpoint.startsWith('/api/')) return;
  
  if (!matchRoute(call.method, call.endpoint)) {
    fails.push(`FAIL: ${call.file} calls ${call.method.toUpperCase()} ${call.endpoint} but no matching backend route found.`);
  }
});

if (fails.length > 0) {
  console.log(fails.join('\n'));
}
