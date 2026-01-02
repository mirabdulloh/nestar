import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import {} from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}
	// Signup
	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation: signup');
		console.log('input:', input);
		return this.memberService.signup(input);
	}
	// Login
	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		console.log('input:', input);

		return this.memberService.login(input);
	}

	// Authenticated 
	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation: updateMember');
		return this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return this.memberService.getMember();
	}

	/** ADMIN */
	// Authorization: ADMIN
	@Mutation(() => String)
	public async getMemberByAdmin(): Promise<string> {
		console.log('Query: getMemberByAdmin');
		return this.memberService.getMemberByAdmin();
	}

	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Query: updateMemberByAdmin');
		return this.memberService.updateMemberByAdmin();
	}
}
