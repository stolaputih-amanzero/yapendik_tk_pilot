/**
 * WebAuthn FIDO2 API Mocks for Unit & Integration Testing (Suite 38)
 */

export function setupWebAuthnMock(options?: {
  shouldCancel?: boolean;
  shouldFail?: boolean;
  platformAvailable?: boolean;
}) {
  const {
    shouldCancel = false,
    shouldFail = false,
    platformAvailable = true,
  } = options || {};

  const mockRegistrationResponse = {
    id: 'mock_cred_id_1234567890',
    rawId: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
    response: {
      clientDataJSON: new Uint8Array([10, 20, 30]).buffer,
      attestationObject: new Uint8Array([40, 50, 60]).buffer,
      getTransports: () => ['internal'],
      getPublicKey: () => new Uint8Array([1, 2, 3, 4]).buffer,
      getPublicKeyAlgorithm: () => -7, // ES256
      getAuthenticatorData: () => new Uint8Array([1, 2, 3]).buffer,
    },
    type: 'public-key',
    authenticatorAttachment: 'platform',
    getClientExtensionResults: () => ({}),
  };

  const mockAuthenticationResponse = {
    id: 'mock_cred_id_1234567890',
    rawId: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
    response: {
      clientDataJSON: new Uint8Array([10, 20, 30]).buffer,
      authenticatorData: new Uint8Array([1, 2, 3, 4]).buffer,
      signature: new Uint8Array([5, 6, 7, 8]).buffer,
      userHandle: new Uint8Array([9, 10, 11]).buffer,
    },
    type: 'public-key',
    authenticatorAttachment: 'platform',
    getClientExtensionResults: () => ({}),
  };

  if (typeof globalThis !== 'undefined') {
    // Mock navigator.credentials
    if (!(globalThis as any).navigator) {
      (globalThis as any).navigator = {};
    }

    (globalThis as any).navigator.credentials = {
      create: async () => {
        if (shouldCancel) {
          const err: any = new Error('The operation was aborted.');
          err.name = 'NotAllowedError';
          throw err;
        }
        if (shouldFail) {
          throw new Error('Authenticator hardware error');
        }
        return mockRegistrationResponse;
      },
      get: async () => {
        if (shouldCancel) {
          const err: any = new Error('The operation was aborted.');
          err.name = 'NotAllowedError';
          throw err;
        }
        if (shouldFail) {
          throw new Error('Authentication assertion rejected');
        }
        return mockAuthenticationResponse;
      },
    };

    // Mock PublicKeyCredential
    (globalThis as any).PublicKeyCredential = class PublicKeyCredential {
      static isUserVerifyingPlatformAuthenticatorAvailable = async () => platformAvailable;
      static isConditionalMediationAvailable = async () => true;
    };
  }
}
