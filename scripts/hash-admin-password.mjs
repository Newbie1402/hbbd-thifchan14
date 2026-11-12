import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';

const io=createInterface({input:process.stdin,output:process.stdout});
try{const password=await io.question('Admin password (min 12 chars): ');if(password.length<12)throw new Error('Use at least 12 characters.');process.stdout.write(`ADMIN_PASSWORD_HASH=${await bcrypt.hash(password,12)}\n`);}finally{io.close();}
