import { Document, Model, model, Schema } from "mongoose";

export interface IToken {
	address: string;
	name: string;
	symbol: string;
}

const TokenSchemaFields: Record<keyof IToken, any> = {
	address: {
		type: String,
		unique: true,
		required: true,
		index: true,
	},
	name: {
		type: String,
		required: true,
	},
	symbol: {
		type: String,
		required: true,
	},
};

const TokenSchema = new Schema<ITokenDocument, ITokenModel>(TokenSchemaFields, {
	timestamps: false,
});

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {
	something: boolean;
}

export default model<ITokenDocument, ITokenModel>("Token", TokenSchema);
