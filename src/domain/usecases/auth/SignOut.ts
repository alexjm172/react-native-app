import { AuthRepository } from '../../repositories/AuthRepository';
export class SignOut { constructor(private repo: AuthRepository) {} exec(){ return this.repo.signOut(); } }