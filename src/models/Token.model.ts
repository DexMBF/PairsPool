import Papr, { types, schema } from "papr";

const TokenSchema = schema({
	address: types.string({ required: true }),
	name: types.string({ required: true }),
	symbol: types.string({ required: true }),
});

export type TokenDocument = typeof TokenSchema[0];

const Token = new Papr().model("tokens", TokenSchema);

export default Token;
