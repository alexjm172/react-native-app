import React, { useMemo } from 'react';
import {
  View, Text, TextInput, KeyboardAvoidingView, Platform, ImageBackground,
  TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { useAuthVM } from '../../../viewmodels/AuthViewModel';
import { loginStyles as styles } from './styles/Login.styles';

const BG = require('../../../../assets/fondo_login.png');

export default function LoginScreen() {
  const {
    mode, email, nombre, password, loading, error,
    setEmail, setNombre, setPassword, toggleMode, submit,
  } = useAuthVM();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} imageStyle={styles.bgImage}>
        <View style={styles.dim} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>

              {mode === 'register' && (
                <>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    placeholder="Tu nombre"
                    placeholderTextColor="#8a8a8a"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Introduce tu email"
                placeholderTextColor="#8a8a8a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                style={styles.input}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                placeholder="Introduce tu contraseña"
                placeholderTextColor="#8a8a8a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                onSubmitEditing={submit}
                returnKeyType="go"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { paddingVertical: mode === 'login' ? 14 : 18 }, loading && { opacity: 0.7 }]}
                onPress={submit}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? <ActivityIndicator /> : (
                  <Text style={styles.primaryText}>{mode === 'login' ? 'Entrar' : 'Registrarme'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleMode} style={styles.linkBtn}>
                <Text style={styles.linkText}>
                  {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}