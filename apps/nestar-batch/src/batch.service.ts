import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/nestar-api/src/libs/dto/member/member';
import { Property } from 'apps/nestar-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/nestar-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}
	public async batchRollBack(): Promise<void> {
		console.log('Executing batchRollBack...');
		await this.propertyModel
			.updateMany(
				{
					propertyStatus: PropertyStatus.ACTIVE,
				},
				{ propertyRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		console.log('Executing batchProperties...');
		const properties: Property[] = await this.propertyModel
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();

		const promisedList = properties.map(async (ele: Property) => {
			const { _id, propertyLikes, propertyViews } = ele;
			const rank = propertyLikes * 2 + propertyViews * 1;
			await this.propertyModel.updateOne({ _id }, { propertyRank: rank }).exec();
		});

		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		console.log('Executing batchAgents...');
		const agents: Member[] = await this.memberModel
			.find({
				memberStatus: MemberStatus.ACTIVE,
				memberType: MemberType.AGENT,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberProperties * 5 + memberLikes * 2 + memberArticles * 3 + memberViews * 1;
			await this.memberModel.updateOne({ _id }, { memberRank: rank }).exec();
		});

		await Promise.all(promisedList);
	}

	getHello(): string {
		return 'Welcome to Nestar Batch Server!';
	}
}
