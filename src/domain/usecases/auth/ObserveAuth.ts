import { AuthRepository } from '../../repositories/AuthRepository';
import { User } from '../../entities/User';
export class ObserveAuth { constructor(private repo: AuthRepository) {} exec(cb:(u:User|null)=>void){ return this.repo.observeAuth(cb); } }