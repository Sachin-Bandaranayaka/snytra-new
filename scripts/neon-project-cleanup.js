#!/usr/bin/env node

/**
 * This script helps identify and delete unused Neon projects.
 * It requires the NEON_API_KEY to be set in the environment.
 */

const https = require('https');
const readline = require('readline');

// Read the API key from .env.local file
require('dotenv').config({ path: '.env.local' });

const NEON_API_KEY = process.env.NEON_API_KEY;

if (!NEON_API_KEY) {
  console.error('Error: NEON_API_KEY is not set in the environment variables');
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Makes a request to the Neon API
 * @param {string} method - HTTP method (GET, POST, DELETE)
 * @param {string} path - API path
 * @param {Object} [data] - Request body data
 * @returns {Promise<Object>} Response data
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'console.neon.tech',
      port: 443,
      path: `/api/v2${path}`,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          if (body) {
            const data = JSON.parse(body);
            resolve(data);
          } else {
            resolve({});
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Lists all Neon projects
 * @returns {Promise<Array>} List of projects
 */
async function listProjects() {
  try {
    const response = await makeRequest('GET', '/projects');
    return response.projects || [];
  } catch (error) {
    console.error('Error listing projects:', error.message);
    return [];
  }
}

/**
 * Deletes a Neon project
 * @param {string} projectId - Project ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteProject(projectId) {
  try {
    await makeRequest('DELETE', `/projects/${projectId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Fetching Neon projects...');
    const projects = await listProjects();
    
    if (projects.length === 0) {
      console.log('No projects found.');
      rl.close();
      return;
    }

    console.log('\nYour Neon projects:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name || 'Unnamed project'} (ID: ${project.id})`);
      console.log(`   Created: ${new Date(project.created_at).toLocaleString()}`);
      console.log(`   Region: ${project.region_id}`);
      console.log(''); 
    });

    if (projects.length <= 1) {
      console.log('You have only one project. No cleanup needed.');
      rl.close();
      return;
    }

    // Extract active project ID from DATABASE_URL in .env.local
    const dbUrl = process.env.DATABASE_URL || '';
    const activeProjectId = extractProjectId(dbUrl);
    
    if (activeProjectId) {
      console.log(`\nActive project ID (from DATABASE_URL): ${activeProjectId}`);
    }

    rl.question('\nEnter the number of the project to delete (or "q" to quit): ', async (answer) => {
      if (answer.toLowerCase() === 'q') {
        console.log('Exiting without changes.');
        rl.close();
        return;
      }

      const projectIndex = parseInt(answer) - 1;
      if (isNaN(projectIndex) || projectIndex < 0 || projectIndex >= projects.length) {
        console.log('Invalid project number.');
        rl.close();
        return;
      }

      const projectToDelete = projects[projectIndex];
      
      // Safety check for active project
      if (projectToDelete.id === activeProjectId) {
        rl.question(`WARNING: You are about to delete the active project (${projectToDelete.name}). Are you sure? (yes/no): `, async (confirmation) => {
          if (confirmation.toLowerCase() !== 'yes') {
            console.log('Deletion cancelled.');
            rl.close();
            return;
          }
          await confirmAndDelete(projectToDelete);
        });
      } else {
        await confirmAndDelete(projectToDelete);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

/**
 * Confirm and delete a project
 * @param {Object} project - Project to delete
 */
async function confirmAndDelete(project) {
  rl.question(`Confirm deletion of project "${project.name || 'Unnamed'}" (ID: ${project.id})? (yes/no): `, async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      console.log(`Deleting project ${project.id}...`);
      const success = await deleteProject(project.id);
      if (success) {
        console.log(`Project ${project.id} deleted successfully!`);
      }
    } else {
      console.log('Deletion cancelled.');
    }
    rl.close();
  });
}

/**
 * Extract project ID from DATABASE_URL
 * @param {string} url - Database connection URL
 * @returns {string|null} Project ID or null
 */
function extractProjectId(url) {
  // This is a simple extraction based on common Neon URL format
  // May need to be adjusted based on the exact URL format
  const match = url.match(/ep-[\w-]+-(\w+)/);
  return match ? match[1] : null;
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
  process.exit(1);
}); 