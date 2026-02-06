#!/usr/bin/env node

/**
 * Portfolio Feature Setup Checker
 * 
 * This script checks if the portfolio feature is properly set up
 * and provides guidance on what needs to be done.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function checkSetup() {
  console.log(`${BLUE}╔════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║  Portfolio Feature Setup Checker          ║${RESET}`);
  console.log(`${BLUE}╚════════════════════════════════════════════╝${RESET}\n`);

  let allGood = true;

  // Check 1: Migration file exists
  console.log('📁 Checking migration file...');
  const migrationPath = path.join(__dirname, 'prisma', 'migrations');
  const migrationExists = fs.existsSync(migrationPath);
  
  if (migrationExists) {
    const migrations = fs.readdirSync(migrationPath);
    const portfolioMigration = migrations.find(m => m.includes('portfolio'));
    
    if (portfolioMigration) {
      console.log(`${GREEN}✓${RESET} Migration file found: ${portfolioMigration}\n`);
    } else {
      console.log(`${YELLOW}⚠${RESET} Migration file not found\n`);
      allGood = false;
    }
  } else {
    console.log(`${RED}✗${RESET} Migrations directory not found\n`);
    allGood = false;
  }

  // Check 2: Database columns
  console.log('🗄️  Checking database schema...');
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN (
        'portfolioSlug', 
        'portfolioPublic', 
        'tagline', 
        'techStack',
        'resumeUrl',
        'websiteUrl',
        'linkedinUrl',
        'twitterUrl',
        'portfolioTheme'
      )
    `;

    const foundColumns = result.map(r => r.column_name);
    const requiredColumns = [
      'portfolioSlug',
      'portfolioPublic',
      'tagline',
      'techStack',
      'resumeUrl',
      'websiteUrl',
      'linkedinUrl',
      'twitterUrl',
      'portfolioTheme'
    ];

    const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log(`${GREEN}✓${RESET} All portfolio columns exist in database\n`);
    } else {
      console.log(`${RED}✗${RESET} Missing columns: ${missingColumns.join(', ')}\n`);
      allGood = false;
    }
  } catch (error) {
    console.log(`${RED}✗${RESET} Could not check database schema`);
    console.log(`   Error: ${error.message}\n`);
    allGood = false;
  }

  // Check 3: Prisma schema file
  console.log('📄 Checking Prisma schema...');
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const hasPortfolioFields = schemaContent.includes('portfolioSlug');
    
    if (hasPortfolioFields) {
      console.log(`${GREEN}✓${RESET} Prisma schema includes portfolio fields\n`);
    } else {
      console.log(`${RED}✗${RESET} Prisma schema missing portfolio fields\n`);
      allGood = false;
    }
  } else {
    console.log(`${RED}✗${RESET} Prisma schema file not found\n`);
    allGood = false;
  }

  // Summary
  console.log(`${BLUE}═══════════════════════════════════════════${RESET}\n`);
  
  if (allGood) {
    console.log(`${GREEN}✓ Portfolio feature is properly set up!${RESET}\n`);
    console.log('You can now:');
    console.log('1. Navigate to /dashboard/portfolio-settings');
    console.log('2. Configure your portfolio');
    console.log('3. Share your portfolio link\n');
  } else {
    console.log(`${RED}✗ Portfolio feature needs setup${RESET}\n`);
    console.log('Please run the following commands:\n');
    console.log(`${YELLOW}1. npx prisma migrate dev --name add_portfolio_fields${RESET}`);
    console.log(`${YELLOW}2. npx prisma generate${RESET}`);
    console.log(`${YELLOW}3. npm run dev${RESET}\n`);
    console.log('Then run this checker again to verify.\n');
  }

  await prisma.$disconnect();
  process.exit(allGood ? 0 : 1);
}

checkSetup().catch((error) => {
  console.error(`${RED}Error running setup checker:${RESET}`, error);
  process.exit(1);
});
