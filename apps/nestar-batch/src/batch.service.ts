import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
	public async batchRollBack(): Promise<void> {
		console.log('Executing batchRollBack...');
	}

	public async batchProperties(): Promise<void> {
		console.log('Executing batchProperties...');
	}

	public async batchAgents(): Promise<void> {
		console.log('Executing batchAgents...');
	}

	getHello(): string {
		return 'Welcome to Nestar Batch Server!';
	}
}
