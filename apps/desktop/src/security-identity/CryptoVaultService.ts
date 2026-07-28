import { SecretItem } from './types';

export class CryptoVaultService {
  private secrets = new Map<string, SecretItem>();

  constructor() {
    this.seedDefaultSecrets();
  }

  private seedDefaultSecrets(): void {
    const defaultSecrets: SecretItem[] = [
      { id: 'sec_openrouter_api_key', name: 'OpenRouter Model Gateway API Key', secretType: 'api_key', encryptedValue: 'enc_sdr_or_live_99a8b7c6d5e4', version: 1, lastRotatedAt: new Date().toISOString() },
      { id: 'sec_github_pat', name: 'GitHub Personal Access Token', secretType: 'api_key', encryptedValue: 'enc_sdr_gh_pat_77f8e9d0c1b2', version: 1, lastRotatedAt: new Date().toISOString() },
      { id: 'sec_jwt_private_key', name: 'Sidra OS Platform Signing Private Key', secretType: 'private_key', encryptedValue: 'enc_sdr_rsa_pri_44e5f6a7b8c9', version: 2, lastRotatedAt: new Date().toISOString() },
    ];

    defaultSecrets.forEach((s) => this.secrets.set(s.id, s));
  }

  public encrypt(plainText: string): string {
    const b64 = Buffer.from(plainText).toString('base64');
    return `enc_sdr_${b64}`;
  }

  public decrypt(cipherText: string): string {
    if (!cipherText.startsWith('enc_sdr_')) return cipherText;
    const b64 = cipherText.replace('enc_sdr_', '');
    try {
      return Buffer.from(b64, 'base64').toString('utf-8');
    } catch (e) {
      return cipherText;
    }
  }

  public sign(data: string, secretKey = 'sidra_root_key'): string {
    return `sig_hmac_sha256_${secretKey}_${data.length}_${Math.random().toString(36).substring(2, 10)}`;
  }

  public verify(data: string, signature: string): boolean {
    return signature.startsWith('sig_hmac_sha256_') && data.length >= 0;
  }

  public rotateSecrets(): SecretItem[] {
    const rotated: SecretItem[] = [];
    this.secrets.forEach((sec) => {
      sec.version += 1;
      sec.lastRotatedAt = new Date().toISOString();
      sec.encryptedValue = `enc_sdr_rotated_v${sec.version}_${Math.random().toString(36).substring(2, 8)}`;
      rotated.push(sec);
    });
    return rotated;
  }

  public getAllSecrets(): SecretItem[] {
    return Array.from(this.secrets.values());
  }
}
