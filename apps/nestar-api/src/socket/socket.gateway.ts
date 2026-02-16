import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
interface MessagePayload {
	event: string;
	text: string;
}

interface infoPayload {
	event: string;
	totalClients: number;
}
@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(` WebSocket Server Initialized total ${this.summaryClient}`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.verbose(`=== Connection & total ${this.summaryClient} ===`);

		const infoMsg: infoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};
		this.emitMessage(infoMsg);
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.verbose(`=== Disconnected & total ${this.summaryClient} ===`);

		const infoMsg: infoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};
		this.broadcastMessage(client, infoMsg);
	}
	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const newMsg: MessagePayload = {
			event: 'message',
			text: payload,
		};
		this.logger.verbose(`New Message: ${payload}`);
		this.emitMessage(newMsg);
	}

	private emitMessage(message: infoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private broadcastMessage(sender: WebSocket, message: infoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
