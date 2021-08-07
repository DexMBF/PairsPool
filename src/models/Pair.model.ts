import { Document, Model, model, Schema } from "mongoose";

export interface IPair {
	address: string;
	token0: string;
	token1: string;
	date: number;
}

const PairSchemaFields: Record<keyof IPair, any> = {
	address: {
		type: String,
		unique: true,
		required: true,
	},
	token0: {
		type: Schema.Types.ObjectId,
		ref: "Token",
	},
	token1: {
		type: Schema.Types.ObjectId,
		ref: "Token",
	},
	date: {
		type: Number,
		required: true,
	},
};

const PairSchema = new Schema<IPairDocument, IPairModel>(PairSchemaFields, {
	timestamps: false,
});

export interface IPairDocument extends IPair, Document {}

export interface IPairModel extends Model<IPairDocument> {
	something?: boolean;
}

export default model<IPairDocument, IPairModel>("Pair", PairSchema);
