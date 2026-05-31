#!/usr/bin/env ts-node
/**
 * Script to clear WhatsApp session credentials
 * Clears local auth_info folder and the Supabase whatsapp_auth_state table
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { initSupabase, getSupabaseClient } from '../src/supabase';
import { AUTH_FOLDER } from '../src/config';

async function main() {
  console.log('='.repeat(60));
  console.log('CLEARING WHATSAPP AUTHENTICATION STATE');
  console.log('='.repeat(60));

  // 1. Clear Supabase Auth State
  console.log('\n[1/2] Connecting to Supabase...');
  initSupabase();
  const supabase = getSupabaseClient();

  if (supabase) {
    console.log('Connected. Clearing whatsapp_auth_state table...');
    try {
      const { error } = await supabase
        .from('whatsapp_auth_state')
        .delete()
        .neq('key', ''); // Delete all rows

      if (error) {
        console.error('❌ Error clearing Supabase auth table:', error.message);
      } else {
        console.log('✅ Successfully cleared whatsapp_auth_state in Supabase!');
      }
    } catch (err) {
      console.error('❌ Exception clearing Supabase auth table:', err);
    }
  } else {
    console.log('⚠️ Supabase client not initialized or offline. Skipping DB cleanup.');
  }

  // 2. Clear Local Auth Folder
  console.log('\n[2/2] Clearing local auth_info folder...');
  const resolvedAuthFolder = path.resolve(process.cwd(), AUTH_FOLDER);
  
  if (fs.existsSync(resolvedAuthFolder)) {
    try {
      fs.rmSync(resolvedAuthFolder, { recursive: true, force: true });
      console.log(`✅ Successfully deleted local folder: ${resolvedAuthFolder}`);
    } catch (err) {
      console.error(`❌ Error deleting local folder ${resolvedAuthFolder}:`, err);
    }
  } else {
    console.log(`ℹ️ Local folder ${resolvedAuthFolder} does not exist. Skipping folder deletion.`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('AUTHENTICATION STATE CLEARED SUCCESSFULLY!');
  console.log('Restart the bot to authenticate and scan a new QR code.');
  console.log('='.repeat(60));
  
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during auth cleanup:', err);
  process.exit(1);
});
