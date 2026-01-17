import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Follower, Following } from '../../libs/dto/follow/follow';
import { MemberService } from '../member/member.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private readonly memberService: MemberService,
	) {}
}
