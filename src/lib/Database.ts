import mongodb, { MongoClient } from "mongodb";
import Papr from "papr";

export class Database {
	private _client: MongoClient;
	private _papr: Papr;

	constructor() {
		this._papr = new Papr();
		this._client = null as any;
	}

	async connect(): Promise<void> {
		this._client = await mongodb.MongoClient.connect(process.env.MONGODB_DATABASE as string, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		this._papr.initialize(this._client.db("pairspool"));
		await this._papr.updateSchemas();
	}

	async close(): Promise<void> {
		await this._client.close();
	}

	get client(): MongoClient {
		return this._client;
	}
}
