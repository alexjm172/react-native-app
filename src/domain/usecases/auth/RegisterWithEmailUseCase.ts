import { AuthRepository } from '../../repositories/AuthRepository';
export class RegisterWithEmail { constructor(private repo: AuthRepository) {} exec(n: string, e: string, p: string) { return this.repo.signUpWithEmail(n,e,p); } }
