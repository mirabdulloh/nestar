import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');
	constructor(private readonly batchService: BatchService) {}

	@Timeout(1000)
	handleInterval() {
		this.logger['context'] = 'SERVER READY';
		this.logger.debug('BATCH SERVER READY!!!');
	}

	@Cron('00 * * * * *', { name: BATCH_ROLLBACK })
	public async batchRollBack() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECUTE ROLLBACK BATCH JOB');

			await this.batchService.batchRollBack();
		} catch (err) {
			this.logger.error('ROLLBACK BATCH JOB FAILED', err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_PROPERTIES })
	public async batchProperties() {
		try {
			this.logger['context'] = BATCH_TOP_PROPERTIES;
			this.logger.debug('EXECUTE TOP PROPERTIES BATCH JOB');
			await this.batchService.batchProperties();
		} catch (err) {
			this.logger.error('batchProperties BATCH JOB FAILED', err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_AGENTS })
	public async batchAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTE TOP AGENTS BATCH JOB');
			await this.batchService.batchAgents();
		} catch (err) {
			this.logger.error('Batch TopAgents', err);
		}
	}

	/**
  @INterval(1000)
	handleInterval() {
		this.logger.debug('INTERVAL TEST');
	}
  */

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
