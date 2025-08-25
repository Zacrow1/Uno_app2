#!/usr/bin/env node

// Script para probar la API del juego UNO
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Probando API del juego UNO...\n');

    // Test 1: Registro de usuario
    console.log('1. Registrando usuario...');
    try {
        const registerResponse = await fetch(`${BASE_URL}/players/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        if (registerResponse.ok) {
            console.log('✅ Usuario registrado exitosamente');
        } else {
            console.log('⚠️  El usuario ya existe o hubo un error en el registro');
        }
    } catch (error) {
        console.error('❌ Error en registro:', error.message);
    }

    // Test 2: Login de usuario
    console.log('\n2. Iniciando sesión...');
    try {
        const loginResponse = await fetch(`${BASE_URL}/players/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'password123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login exitoso');
            console.log('   Token:', loginData.token.substring(0, 50) + '...');
            
            // Guardar token para siguientes pruebas
            const token = loginData.token;
            
            // Test 3: Obtener perfil
            console.log('\n3. Obteniendo perfil de usuario...');
            try {
                const profileResponse = await fetch(`${BASE_URL}/players/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log('✅ Perfil obtenido exitosamente');
                    console.log('   Usuario:', profileData.username);
                    console.log('   Email:', profileData.email);
                } else {
                    console.log('❌ Error al obtener perfil');
                }
            } catch (error) {
                console.error('❌ Error en perfil:', error.message);
            }
            
            // Test 4: Crear juego
            console.log('\n4. Creando juego...');
            try {
                const gameResponse = await fetch(`${BASE_URL}/games`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: 'Test Game',
                        rules: 'Standard UNO rules',
                        maxPlayers: 4
                    })
                });
                
                if (gameResponse.ok) {
                    const gameData = await gameResponse.json();
                    console.log('✅ Juego creado exitosamente');
                    console.log('   ID del juego:', gameData.id);
                    console.log('   Nombre:', gameData.name);
                    
                    // Test 5: Listar juegos
                    console.log('\n5. Listando juegos...');
                    try {
                        const gamesResponse = await fetch(`${BASE_URL}/games`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (gamesResponse.ok) {
                            const gamesData = await gamesResponse.json();
                            console.log('✅ Juegos listados exitosamente');
                            console.log('   Total de juegos:', gamesData.length);
                        } else {
                            console.log('❌ Error al listar juegos');
                        }
                    } catch (error) {
                        console.error('❌ Error en listado de juegos:', error.message);
                    }
                } else {
                    console.log('❌ Error al crear juego');
                }
            } catch (error) {
                console.error('❌ Error en creación de juego:', error.message);
            }
            
        } else {
            console.log('❌ Error en login');
        }
    } catch (error) {
        console.error('❌ Error en login:', error.message);
    }

    console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar pruebas
testAPI().catch(console.error);