const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('HTeasy Setup Script');
console.log('===================');
console.log('This script will help you set up the HTeasy marketplace application.');
console.log('It will install dependencies and set up the database.');

// Install dependencies
function installDependencies() {
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
    return true;
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    return false;
  }
}

// Update .env file with user input
function updateEnvFile(dbUser, dbPassword) {
  console.log('\nUpdating .env file...');
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update DB_USER and DB_PASSWORD
    envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${dbUser}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${dbPassword}`);
    
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating .env file:', error.message);
    return false;
  }
}

// Run the setup
function runSetup() {
  rl.question('\nEnter your MySQL username (default: root): ', (dbUser) => {
    dbUser = dbUser || 'root';
    
    rl.question('Enter your MySQL password: ', (dbPassword) => {
      console.log('\nStarting setup...');
      
      // Install dependencies
      if (!installDependencies()) {
        console.error('Setup failed at dependency installation step.');
        rl.close();
        return;
      }
      
      // Update .env file
      if (!updateEnvFile(dbUser, dbPassword)) {
        console.error('Setup failed at .env update step.');
        rl.close();
        return;
      }
      
      console.log('\nSetup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Create the database by running the following command in MySQL:');
      console.log('   mysql -u ' + dbUser + ' -p < database/schema.sql');
      console.log('2. Initialize the database with sample data:');
      console.log('   mysql -u ' + dbUser + ' -p < database/init.sql');
      console.log('3. Start the server:');
      console.log('   npm start');
      console.log('\nYour HTeasy marketplace will be available at: http://localhost:3000');
      
      rl.close();
    });
  });
}

// Start the setup
runSetup();
