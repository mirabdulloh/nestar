import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

		if (requestType === 'http') {
			/* Develop if need */
			return next.handle().pipe();
		} else if (requestType === 'graphql') {
			/* (1) Printing Request */
			const gqlContext = GqlExecutionContext.create(context);
			this.logger.log(`Type => ${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');
			/* (2) Error handling via Global GraphQl Integration */

			/* (3) NO Error, then giving Response */
			return next.handle().pipe(
				tap((context) => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`After... ${this.stringify(context)} - ${responseTime}ms `, 'RESPONSE\n\n');
				}),
			);
		}
	}

	private stringify(context: ExecutionContext): string {
		console.log(typeof context);
		return JSON.stringify(context).slice(0, 75);
	}
}
