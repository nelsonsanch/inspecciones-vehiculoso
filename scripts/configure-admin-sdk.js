#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔧 Configuración de Firebase Admin SDK\n');
console.log('Este script te ayudará a configurar las credenciales de Firebase Admin SDK.\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    console.log('Por favor, proporciona el path completo al archivo JSON de credenciales de Firebase.');
    console.log('Ejemplo: /home/ubuntu/Downloads/inspecciones-vehiculoso-firebase-adminsdk-xxxxx.json\n');
    
    const jsonPath = await question('Path al archivo JSON: ');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('\n❌ Error: El archivo no existe en la ruta especificada.');
      console.log('Asegúrate de haber descargado el archivo JSON desde Firebase Console.\n');
      rl.close();
      return;
    }
    
    console.log('\n📖 Leyendo archivo JSON...');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const credentials = JSON.parse(jsonContent);
    
    if (!credentials.client_email || !credentials.private_key) {
      console.error('\n❌ Error: El archivo JSON no contiene las credenciales necesarias.');
      console.log('Asegúrate de descargar el archivo correcto desde Firebase Console.\n');
      rl.close();
      return;
    }
    
    console.log('✅ Credenciales encontradas:');
    console.log(`   Email: ${credentials.client_email}`);
    console.log(`   Private Key: ${credentials.private_key.substring(0, 50)}...\n`);
    
    // Leer el archivo .env actual
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('📝 Archivo .env existente encontrado.');
      
      // Verificar si ya existen las variables
      if (envContent.includes('FIREBASE_ADMIN_CLIENT_EMAIL') || envContent.includes('FIREBASE_ADMIN_PRIVATE_KEY')) {
        const overwrite = await question('\n⚠️  Las variables de Firebase Admin ya existen en .env. ¿Sobrescribir? (s/n): ');
        if (overwrite.toLowerCase() !== 's') {
          console.log('\n❌ Operación cancelada.');
          rl.close();
          return;
        }
        // Remover las líneas existentes
        envContent = envContent
          .split('\n')
          .filter(line => !line.startsWith('FIREBASE_ADMIN_CLIENT_EMAIL') && !line.startsWith('FIREBASE_ADMIN_PRIVATE_KEY'))
          .join('\n');
      }
    } else {
      console.log('📝 Creando nuevo archivo .env...');
    }
    
    // Agregar las nuevas variables
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    
    envContent += '\n# Firebase Admin SDK\n';
    envContent += `FIREBASE_ADMIN_CLIENT_EMAIL="${credentials.client_email}"\n`;
    envContent += `FIREBASE_ADMIN_PRIVATE_KEY="${credentials.private_key}"\n`;
    
    // Escribir el archivo .env
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    console.log('\n✅ Configuración completada exitosamente!');
    console.log('\n📋 Variables agregadas a .env:');
    console.log(`   FIREBASE_ADMIN_CLIENT_EMAIL="${credentials.client_email}"`);
    console.log(`   FIREBASE_ADMIN_PRIVATE_KEY="[REDACTED]"\n`);
    
    console.log('🚀 Próximos pasos:');
    console.log('   1. Reinicia el servidor de desarrollo: yarn dev');
    console.log('   2. Intenta eliminar un conductor desde /admin/conductores');
    console.log('   3. Para producción, configura estas mismas variables en Netlify\n');
    
    console.log('📖 Documentación completa: FIREBASE-ADMIN-SETUP.md\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
