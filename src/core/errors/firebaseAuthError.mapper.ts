/* Mapea códigos de Firebase Auth (Web/React-Native) a mensajes en español. */
export const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/password + credenciales
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'La contraseña no es correcta.',
  'auth/invalid-password': 'La contraseña no es válida.',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  'auth/email-already-in-use': 'Ese email ya está en uso.',
  'auth/missing-email': 'Introduce un email.',
  'auth/missing-password': 'Introduce una contraseña.',
  'auth/invalid-credential': 'Las credenciales no son válidas.',
  'auth/invalid-login-credentials': 'Email o contraseña incorrectos.', // alias reciente
  'auth/user-mismatch': 'Las credenciales no pertenecen a este usuario.',
  'auth/requires-recent-login':
    'Por seguridad, vuelve a iniciar sesión para completar esta acción.',

  // Configuración del proyecto / app
  'auth/operation-not-allowed':
    'Este método de inicio de sesión no está habilitado en el proyecto.',
  'auth/app-not-authorized':
    'La app no está autorizada para usar Firebase Authentication.',
  'auth/invalid-api-key': 'La API key no es válida.',
  'auth/invalid-app-id': 'El ID de la app no es válido.',
  'auth/invalid-tenant-id': 'El tenantId no es válido.',
  'auth/unauthorized-domain':
    'El dominio no está autorizado para realizar esta operación.',
  'auth/argument-error': 'Parámetros inválidos en la llamada.',
  'auth/admin-restricted-operation':
    'Operación restringida por un administrador.',
  'auth/operation-not-supported-in-this-environment':
    'Esta operación no está soportada en el entorno actual.',
  'auth/already-initialized':
    'Auth ya fue inicializado con una configuración diferente.',

  // Red y límites
  'auth/network-request-failed': 'Error de red. Revisa tu conexión.',
  'auth/too-many-requests':
    'Demasiados intentos. Prueba de nuevo más tarde.',
  'auth/quota-exceeded': 'Se ha superado la cuota permitida.',
  'auth/timeout': 'Se agotó el tiempo de espera.',

  // OAuth (Google/Facebook/Apple/etc.)
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con el mismo email pero otro proveedor.',
  'auth/credential-already-in-use':
    'Estas credenciales ya están vinculadas a otra cuenta.',
  'auth/provider-already-linked':
    'Este proveedor ya está vinculado al usuario.',
  'auth/no-such-provider': 'El proveedor indicado no está vinculado.',
  'auth/invalid-oauth-client-id': 'El client ID de OAuth no es válido.',
  'auth/invalid-idp-response':
    'La respuesta del proveedor de identidad no es válida.',
  'auth/rejected-credential':
    'El proveedor rechazó las credenciales proporcionadas.',
  // Popups / Redirect
  'auth/popup-closed-by-user': 'Cerraste la ventana de inicio de sesión.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente.',
  'auth/cancelled-popup-request':
    'Se canceló una ventana previa de autenticación.',
  'auth/no-auth-event':
    'No se recibió el evento de autenticación esperado.',
  'auth/redirect-cancelled-by-user':
    'Se canceló el flujo de redirección.',
  'auth/redirect-operation-pending':
    'Ya hay una operación de redirección en curso.',

  // Teléfono / reCAPTCHA / MFA
  'auth/invalid-phone-number': 'El número de teléfono no es válido.',
  'auth/missing-phone-number': 'Introduce un número de teléfono.',
  'auth/captcha-check-failed': 'Fallo en la verificación de reCAPTCHA.',
  'auth/invalid-verification-code':
    'El código de verificación no es válido.',
  'auth/invalid-verification-id':
    'El ID de verificación no es válido.',
  'auth/missing-verification-code':
    'Falta el código de verificación.',
  'auth/missing-verification-id': 'Falta el ID de verificación.',
  'auth/missing-app-credential':
    'Faltan credenciales de la aplicación para la verificación.',
  'auth/invalid-app-credential':
    'Las credenciales de la aplicación no son válidas.',
  // MFA (autenticación multifactor)
  'auth/multi-factor-auth-required':
    'Se requiere un segundo factor de autenticación.',
  'auth/mfa-info-not-found': 'No se encontró información del segundo factor.',
  'auth/second-factor-already-in-use':
    'Ese segundo factor ya está en uso.',
  'auth/second-factor-limit-exceeded':
    'Has alcanzado el número máximo de segundos factores.',
  'auth/invalid-multi-factor-session':
    'La sesión de multifactor no es válida.',
  'auth/invalid-multi-factor-info':
    'La información de multifactor no es válida.',
  'auth/missing-multi-factor-info':
    'Falta la información del segundo factor.',

  // Enlaces de acción por email
  'auth/expired-action-code': 'El enlace ha caducado.',
  'auth/invalid-action-code': 'El enlace no es válido.',
  'auth/missing-continue-uri': 'Falta la URL de continuación (continueUrl).',
  'auth/invalid-continue-uri': 'La URL de continuación no es válida.',
  'auth/invalid-dynamic-link-domain':
    'El dominio de Dynamic Links no es válido.',
  'auth/invalid-recipient-email':
    'El email del destinatario no es válido.',
  'auth/invalid-sender': 'El remitente no es válido.',
  'auth/invalid-message-payload':
    'El contenido del mensaje no es válido.',
  'auth/missing-ios-bundle-id':
    'Falta el Bundle ID para iOS en la configuración.',
  'auth/missing-android-package-name':
    'Falta el package para Android en la configuración.',

  // Sesiones / tokens
  'auth/invalid-user-token':
    'El token del usuario no es válido. Vuelve a iniciar sesión.',
  'auth/token-expired': 'La sesión ha caducado. Inicia sesión de nuevo.',
  'auth/web-storage-unsupported':
    'El almacenamiento web no está soportado o está deshabilitado.',
  'auth/cordova-not-ready':
    'Cordova aún no está listo para realizar esta operación.',

  // Genéricas
  'auth/internal-error': 'Error interno. Inténtalo de nuevo.',
};

export function mapFirebaseAuthError(e: unknown): string {
  const code = (e as any)?.code as string | undefined;
  if (code && FIREBASE_AUTH_ERROR_MESSAGES[code]) {
    return FIREBASE_AUTH_ERROR_MESSAGES[code];
  }
  // Aglutina algunos alias frecuentes hacia mensajes conocidos
  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return FIREBASE_AUTH_ERROR_MESSAGES['auth/invalid-login-credentials'];
  }
  // Fallback: si viene .message desde Firebase, úsala; si no, genérico.
  return (e as any)?.message ?? 'Se produjo un error. Inténtalo de nuevo.';
}