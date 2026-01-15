import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticleModule } from './board-article.module';
import { Model } from 'mongoose';

@Injectable()
export class BoardArticleService {
	constructor(@InjectModel('BoardArticle') private readonly boardArticle: Model<BoardArticleModule>) {}
}
